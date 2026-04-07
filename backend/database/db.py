"""
Database connection module for Hospital Management System.
Uses psycopg2 with SimpleConnectionPool for connection reuse.
"""

import psycopg2
from psycopg2 import pool, extras

# Connection pool (initialized once, reused across requests)
connection_pool = None


def init_pool():
    """Initialize the PostgreSQL connection pool."""
    global connection_pool
    try:
        connection_pool = pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            host="localhost",
            port="5432",
            database="hosp_manage",
            user="postgres",
            password="123456"
        )
        if connection_pool:
            print("✅ PostgreSQL connection pool created successfully.")
    except Exception as e:
        print(f"❌ Error creating connection pool: {e}")
        raise e


def get_connection():
    """Get a connection from the pool."""
    if connection_pool is None:
        init_pool()
    return connection_pool.getconn()


def release_connection(conn):
    """Return a connection back to the pool."""
    if connection_pool and conn:
        connection_pool.putconn(conn)


def close_all_connections():
    """Close all connections in the pool."""
    if connection_pool:
        connection_pool.closeall()
        print("🔒 All database connections closed.")
