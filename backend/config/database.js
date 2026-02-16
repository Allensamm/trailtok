require('dotenv').config();
const { Sequelize } = require('sequelize');
let sequelize;

if (process.env.DATABASE_URL) {
  // Production/Remote (Supabase, Render, etc.)
  // If an explicit IPv4 address is supplied via DATABASE_IPV4, prefer it to avoid IPv6/ENETUNREACH
  if (process.env.DATABASE_IPV4) {
    const { URL } = require('url');
    try {
      const dbUrl = new URL(process.env.DATABASE_URL);
      const dbName = dbUrl.pathname ? dbUrl.pathname.replace(/^\//, '') : undefined;
      const dbUser = dbUrl.username;
      const dbPass = dbUrl.password;
      const dbPort = dbUrl.port || 5432;
      sequelize = new Sequelize(dbName, dbUser, dbPass, {
        host: process.env.DATABASE_IPV4,
        port: dbPort,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        retry: {
          match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
            /videos/,
            /EAI_AGAIN/
          ],
          max: 3
        }
      });
    } catch (err) {
      console.error('Error parsing DATABASE_URL for DATABASE_IPV4 fallback:', err.message);
      // Fallback to standard URL-based connection
      sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        retry: {
          match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
            /videos/,
            /EAI_AGAIN/
          ],
          max: 3
        }
      });
    }
  } else {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Required for some self-signed certs in cloud DBs
        }
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      retry: {
        match: [
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/,
          /videos/,
          /EAI_AGAIN/
        ],
        max: 3
      }
    });
  }
} else {
  // Local Development
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;
