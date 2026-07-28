import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import {
  Usuario,
  RolUsuario,
  RegistroAlumnoDTO,
  LoginDTO,
  Alumno,
} from '@/types';
import {
  validarCodigoEstudiante,
  validarCorreoInstitucional,
  validarPassword,
} from '@/lib/utils/validaciones';
import bcrypt from 'bcryptjs';

export class AuthService {
  /**
   * Registrar un nuevo alumno
   */
  static async registrarAlumno(data: RegistroAlumnoDTO): Promise<void> {
    // Validaciones
    if (!validarCodigoEstudiante(data.codigo_estudiante)) {
      throw new Error('Código de estudiante inválido. Debe tener 6-8 dígitos.');
    }

    if (!validarCorreoInstitucional(data.email)) {
      throw new Error('Debe usar un correo institucional de la UNAB (@unab.edu.pe)');
    }

    if (!validarPassword(data.password)) {
      throw new Error('La contraseña debe tener al menos 8 caracteres, una letra y un número.');
    }

    // Verificar que el código de estudiante no esté registrado
    const codigoExiste = await this.verificarCodigoEstudianteExiste(data.codigo_estudiante);
    if (codigoExiste) {
      throw new Error('Este código de estudiante ya está registrado.');
    }

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const userId = userCredential.user.uid;

    try {
      // Crear documento de usuario
      const usuario: Usuario = {
        id: userId,
        nombre: data.nombre,
        email: data.email,
        rol: 'alumno',
        estado: 'activo',
        creado_en: new Date(),
        actualizado_en: new Date(),
      };

      await setDoc(doc(firestore, COLLECTIONS.USUARIOS, userId), {
        ...usuario,
        creado_en: serverTimestamp(),
        actualizado_en: serverTimestamp(),
      });

      // Crear documento de alumno
      const alumno: Alumno = {
        id: userId,
        usuario_id: userId,
        codigo_estudiante: data.codigo_estudiante,
        telefono: data.telefono,
        notificaciones_activas: true,
        minutos_notificacion: 5,
        creado_en: new Date(),
        actualizado_en: new Date(),
      };

      await setDoc(doc(firestore, COLLECTIONS.ALUMNOS, userId), {
        ...alumno,
        creado_en: serverTimestamp(),
        actualizado_en: serverTimestamp(),
      });
    } catch (error) {
      // Si falla la creación de documentos, eliminar el usuario de Auth
      await userCredential.user.delete();
      throw error;
    }
  }

  /**
   * Iniciar sesión
   */
  static async login(credentials: LoginDTO): Promise<Usuario> {
    let email = credentials.email_o_codigo;

    // Si se proporciona código de estudiante, buscar el email asociado
    if (validarCodigoEstudiante(credentials.email_o_codigo)) {
      const emailAsociado = await this.obtenerEmailPorCodigoEstudiante(credentials.email_o_codigo);
      if (!emailAsociado) {
        throw new Error('Código de estudiante no encontrado.');
      }
      email = emailAsociado;
    }

    // Autenticar con Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      credentials.password
    );

    // Obtener datos del usuario
    const usuario = await this.obtenerUsuario(userCredential.user.uid);
    if (!usuario) {
      throw new Error('Usuario no encontrado en la base de datos.');
    }

    if (usuario.estado !== 'activo') {
      throw new Error('Tu cuenta está inactiva. Contacta al administrador.');
    }

    return usuario;
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Obtener usuario actual
   */
  static async obtenerUsuarioActual(): Promise<Usuario | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          const usuario = await this.obtenerUsuario(firebaseUser.uid);
          resolve(usuario);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Obtener datos de usuario por ID
   */
  static async obtenerUsuario(userId: string): Promise<Usuario | null> {
    const docRef = doc(firestore, COLLECTIONS.USUARIOS, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      estado: data.estado,
      creado_en: data.creado_en?.toDate() || new Date(),
      actualizado_en: data.actualizado_en?.toDate() || new Date(),
    };
  }

  /**
   * Verificar si un código de estudiante ya existe
   */
  private static async verificarCodigoEstudianteExiste(codigo: string): Promise<boolean> {
    const q = query(
      collection(firestore, COLLECTIONS.ALUMNOS),
      where('codigo_estudiante', '==', codigo)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  /**
   * Obtener email por código de estudiante
   */
  private static async obtenerEmailPorCodigoEstudiante(codigo: string): Promise<string | null> {
    const q = query(
      collection(firestore, COLLECTIONS.ALUMNOS),
      where('codigo_estudiante', '==', codigo)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const alumnoDoc = querySnapshot.docs[0];
    const usuarioDoc = await getDoc(
      doc(firestore, COLLECTIONS.USUARIOS, alumnoDoc.data().usuario_id)
    );

    return usuarioDoc.exists() ? usuarioDoc.data().email : null;
  }

  /**
   * Observar cambios en la autenticación
   */
  static onAuthChange(callback: (usuario: Usuario | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const usuario = await this.obtenerUsuario(firebaseUser.uid);
        callback(usuario);
      } else {
        callback(null);
      }
    });
  }
}
