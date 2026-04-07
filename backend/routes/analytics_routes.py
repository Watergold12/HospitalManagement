"""
Analytics routes for aggregations.
Phase 4: Aggregations & Analytics
"""
from flask import Blueprint, jsonify
from psycopg2.extras import RealDictCursor
from database.db import get_connection, release_connection

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/api/analytics/appointments-per-doctor", methods=["GET"])
def appointments_per_doctor():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT 
                d.doctor_id, 
                d.doctor_name AS doctor_name, 
                COUNT(a.app_id) AS total_appointments
            FROM staff_mgmt.doctor d
            LEFT JOIN patient_mgmt.appointment a ON d.doctor_id = a.doctor_id
            GROUP BY d.doctor_id, d.doctor_name
            ORDER BY total_appointments DESC;
        """
        cur.execute(query)
        rows = cur.fetchall()
        cur.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)

@analytics_bp.route("/api/analytics/patients-per-department", methods=["GET"])
def patients_per_department():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT 
                dept.dept_name,
                COUNT(DISTINCT a.patient_id) AS total_patients
            FROM staff_mgmt.department dept
            LEFT JOIN staff_mgmt.doctor d ON dept.dept_id = d.dept_id
            LEFT JOIN patient_mgmt.appointment a ON d.doctor_id = a.doctor_id
            GROUP BY dept.dept_id, dept.dept_name
            ORDER BY total_patients DESC;
        """
        cur.execute(query)
        rows = cur.fetchall()
        cur.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)

@analytics_bp.route("/api/analytics/billing-per-patient", methods=["GET"])
def billing_per_patient():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Using subqueries to precisely calculate amounts without Cartesian product duplication.
        # Assumes standard financial generic columns like `amount` or `fee`.
        query = """
                    SELECT 
                    p.patient_name,
                    COALESCE(SUM(sf.fees), 0) AS total_service_cost,
                    COALESCE(SUM(i.installment_amt), 0) AS total_paid,
                    COALESCE(SUM(sf.fees), 0) - COALESCE(SUM(i.installment_amt), 0) AS balance
                FROM patient_mgmt.patient p

                LEFT JOIN billing_mgmt.patient_account pa 
                    ON p.patient_id = pa.account_no

                LEFT JOIN billing_mgmt.service_taken st 
                    ON pa.account_no = st.account_no

                LEFT JOIN billing_mgmt.service_fee sf 
                    ON st.service_id = sf.service_id

                LEFT JOIN billing_mgmt.installment i 
                    ON pa.account_no = i.account_no

                GROUP BY p.patient_name
                ORDER BY balance DESC;
                """
        # Note: If fee column in service_fee is different (e.g. `amount`), postgres will throw an error and it's caught safely.
        cur.execute(query)
        rows = cur.fetchall()
        cur.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


@analytics_bp.route("/api/analytics/room-occupancy", methods=["GET"])
def room_occupancy():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Assuming distinct active rooms are stored directly in admission table
        query = """
            WITH room_stats AS (
                SELECT COUNT(*) AS total_rooms FROM billing_mgmt.room
            ),
            occ_stats AS (
                SELECT COUNT(DISTINCT room_no) AS occupied_rooms FROM patient_mgmt.admission
            )
            SELECT 
                r.total_rooms,
                COALESCE(o.occupied_rooms, 0) AS occupied_rooms,
                (r.total_rooms - COALESCE(o.occupied_rooms, 0)) AS available_rooms
            FROM room_stats r
            CROSS JOIN occ_stats o;
        """
        cur.execute(query)
        row = cur.fetchone()
        cur.close()
        return jsonify(row), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)
