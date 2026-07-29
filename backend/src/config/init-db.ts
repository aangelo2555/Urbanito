import fs from 'fs';
import path from 'path';
import { db } from './database';

export async function autoMigrateDatabase() {
  try {
    const checkRes = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `);

    const tableExists = checkRes.rows[0]?.exists;
    if (!tableExists) {
      console.log('🔄 Initializing PostgreSQL database schema automatically...');
      
      const possibleSchemaPaths = [
        path.join(process.cwd(), 'sql/schema.sql'),
        path.join(__dirname, '../../sql/schema.sql'),
        path.join(__dirname, '../../../database/schema.sql'),
      ];

      let schemaSql = '';
      for (const p of possibleSchemaPaths) {
        if (fs.existsSync(p)) {
          schemaSql = fs.readFileSync(p, 'utf8');
          console.log(`📜 Loaded schema SQL from ${p}`);
          break;
        }
      }

      if (schemaSql) {
        await db.query(schemaSql);
        console.log('✅ PostgreSQL database schema created successfully!');

        const possibleSeedPaths = [
          path.join(process.cwd(), 'sql/seed.sql'),
          path.join(__dirname, '../../sql/seed.sql'),
          path.join(__dirname, '../../../database/seed.sql'),
        ];

        let seedSql = '';
        for (const p of possibleSeedPaths) {
          if (fs.existsSync(p)) {
            seedSql = fs.readFileSync(p, 'utf8');
            console.log(`🌱 Loaded seed SQL from ${p}`);
            break;
          }
        }

        if (seedSql) {
          await db.query(seedSql);
          console.log('✅ PostgreSQL database seeded successfully!');
        }
      } else {
        console.warn('⚠️ Could not find schema.sql to execute.');
      }
    } else {
      console.log('✅ PostgreSQL tables already exist.');
      // Asegurar que la columna password_hash existe
      await db.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);`);
    }
  } catch (error) {
    console.error('⚠️ Auto database migration failed/skipped:', error);
  }
}
