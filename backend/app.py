"""
Hospital Management System — Flask Backend
Phase 1: Database connection + department CRUD only.
"""

from flask import Flask
from flask_cors import CORS
from database.db import init_pool, close_all_connections
from routes.department_routes import department_bp
from routes.doctor_routes import doctor_bp
from routes.nurse_routes import nurse_bp
from routes.patient_routes import patient_bp
from routes.appointment_routes import appointment_bp
from routes.admission_routes import admission_bp
from routes.prescription_routes import prescription_bp
from routes.service_routes import service_bp
from routes.service_fee_routes import service_fee_bp
from routes.patient_account_routes import patient_account_bp
from routes.installment_routes import installment_bp
from routes.service_taken_routes import service_taken_bp
from routes.room_routes import room_bp

# Phase 4 (Analytics)
from routes.analytics_routes import analytics_bp

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests for future frontend

# Register route blueprints
app.register_blueprint(department_bp)
app.register_blueprint(doctor_bp)
app.register_blueprint(nurse_bp)
app.register_blueprint(patient_bp)
app.register_blueprint(appointment_bp)
app.register_blueprint(admission_bp)
app.register_blueprint(prescription_bp)
app.register_blueprint(service_bp)
app.register_blueprint(service_fee_bp)
app.register_blueprint(patient_account_bp)
app.register_blueprint(installment_bp)
app.register_blueprint(service_taken_bp)
app.register_blueprint(room_bp)
app.register_blueprint(analytics_bp)


@app.route("/")
def health_check():
    return {"status": "ok", "message": "Hospital Management System API is running."}


if __name__ == "__main__":
    init_pool()
    try:
        app.run(debug=True, port=5000)
    finally:
        close_all_connections()
