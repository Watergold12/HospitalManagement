"""
CRUD routes for staff_mgmt.nurse table.
"""

from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from database.db import get_connection, release_connection

nurse_bp = Blueprint("nurses", __name__)

@nurse_bp.route("/api/nurses", methods=["GET"])
def get_all_nurses():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM staff_mgmt.nurse ORDER BY nurse_id;")
        rows = cur.fetchall()
        cur.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


@nurse_bp.route("/api/nurses/<int:nurse_id>", methods=["GET"])
def get_nurse(nurse_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM staff_mgmt.nurse WHERE nurse_id = %s;", (nurse_id,))
        row = cur.fetchone()
        cur.close()
        if row is None:
            return jsonify({"error": "Nurse not found"}), 404
        return jsonify(row), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


@nurse_bp.route("/api/nurses", methods=["POST"])
def create_nurse():
    conn = None
    try:
        data = request.get_json()
        if not data or "name" not in data or "dept_id" not in data:
            return jsonify({"error": "name and dept_id are required"}), 400

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """INSERT INTO staff_mgmt.nurse (name, shift, phone, dept_id)
               VALUES (%s, %s, %s, %s) RETURNING *;""",
            (data["name"], data.get("shift"), data.get("phone"), data["dept_id"])
        )
        new_nurse = cur.fetchone()
        conn.commit()
        cur.close()
        return jsonify(new_nurse), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


@nurse_bp.route("/api/nurses/<int:nurse_id>", methods=["PUT"])
def update_nurse(nurse_id):
    conn = None
    try:
        data = request.get_json()
        if not data or "name" not in data or "dept_id" not in data:
            return jsonify({"error": "name and dept_id are required"}), 400

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """UPDATE staff_mgmt.nurse
               SET name = %s, shift = %s, phone = %s, dept_id = %s
               WHERE nurse_id = %s RETURNING *;""",
            (data["name"], data.get("shift"), data.get("phone"), data["dept_id"], nurse_id)
        )
        updated = cur.fetchone()
        conn.commit()
        cur.close()
        if updated is None:
            return jsonify({"error": "Nurse not found"}), 404
        return jsonify(updated), 200
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


@nurse_bp.route("/api/nurses/<int:nurse_id>", methods=["DELETE"])
def delete_nurse(nurse_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("DELETE FROM staff_mgmt.nurse WHERE nurse_id = %s RETURNING *;", (nurse_id,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
        if deleted is None:
            return jsonify({"error": "Nurse not found"}), 404
        return jsonify({"message": "Nurse deleted", "nurse": deleted}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)
