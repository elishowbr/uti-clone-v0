-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('VACANT', 'OCCUPIED', 'CLEANING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('DOCTOR', 'NURSE', 'ADMIN', 'MANAGER');

-- CreateTable
CREATE TABLE "hospitals" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "available_beds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "crm" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3),
    "height" INTEGER,
    "weight" DOUBLE PRECISION,
    "gender" "Sex",
    "commentary" TEXT,
    "arrival_date" TIMESTAMP(3),
    "admission_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discharge_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beds" (
    "id" SERIAL NOT NULL,
    "bed_number" INTEGER NOT NULL,
    "label" TEXT,
    "type" TEXT,
    "status" "BedStatus" NOT NULL DEFAULT 'VACANT',
    "hospital_id" INTEGER,
    "current_patient_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_evolutions" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "patient_sex" "Sex",
    "bed_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "patient_weight" DOUBLE PRECISION,
    "patient_height" DOUBLE PRECISION,
    "airway_type" TEXT,
    "respiratory_support" JSONB,
    "respiratory_spo2" TEXT,
    "respiratory_sao2" TEXT,
    "respiratory_observation" TEXT,
    "respiratory_chest_xray" TEXT,
    "neurologic_sedation" JSONB,
    "neurologic_scales" TEXT,
    "neurologic_pupils" TEXT,
    "neurologic_bis" TEXT,
    "neurologic_pic" TEXT,
    "neurologic_enteral" TEXT,
    "neurologic_observation" TEXT,
    "hemodynamic_drugs" JSONB,
    "hemodynamic_pam" TEXT,
    "hemodynamic_fc" TEXT,
    "hemodynamic_rhythm" TEXT,
    "hemodynamic_enteral" TEXT,
    "hemodynamic_tec" TEXT,
    "hemodynamic_lactate" TEXT,
    "hemodynamic_svco2" TEXT,
    "hemodynamic_gapco2" TEXT,
    "hemodynamic_observation" TEXT,
    "renal_diuresis" TEXT,
    "renal_diuretics" TEXT,
    "renal_balance" TEXT,
    "renal_dialysis" TEXT,
    "renal_glycemia" TEXT,
    "renal_insulin" TEXT,
    "renal_observation" TEXT,
    "nutrition_support" TEXT,
    "nutrition_residue" TEXT,
    "nutrition_prokinetics" TEXT,
    "nutrition_evacuation" TEXT,
    "nutrition_abdomen" TEXT,
    "nutrition_surgical" BOOLEAN DEFAULT false,
    "nutrition_drains" TEXT,
    "nutrition_wound" TEXT,
    "hemato_antibiotics" JSONB,
    "hemato_cultures" JSONB,
    "hemato_temperature" TEXT,
    "hemato_biomarkers" TEXT,
    "hemato_corticoid" TEXT,
    "hemato_observation" TEXT,
    "prophylaxis_tev" TEXT,
    "prophylaxis_ibp" TEXT,
    "prophylaxis_others" TEXT,
    "generated_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_evolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_evolutions" (
    "id" SERIAL NOT NULL,
    "bed_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "patient_id" INTEGER,
    "form_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draft_evolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'NURSE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctors_user_id_key" ON "doctors"("user_id");

-- CreateIndex
CREATE INDEX "doctors_user_id_idx" ON "doctors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "beds_bed_number_key" ON "beds"("bed_number");

-- CreateIndex
CREATE UNIQUE INDEX "beds_current_patient_id_key" ON "beds"("current_patient_id");

-- CreateIndex
CREATE INDEX "beds_hospital_id_idx" ON "beds"("hospital_id");

-- CreateIndex
CREATE INDEX "clinical_evolutions_patient_id_created_at_idx" ON "clinical_evolutions"("patient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "clinical_evolutions_bed_id_idx" ON "clinical_evolutions"("bed_id");

-- CreateIndex
CREATE INDEX "clinical_evolutions_doctor_id_idx" ON "clinical_evolutions"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "draft_evolutions_bed_id_doctor_id_key" ON "draft_evolutions"("bed_id", "doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_current_patient_id_fkey" FOREIGN KEY ("current_patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_evolutions" ADD CONSTRAINT "clinical_evolutions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_evolutions" ADD CONSTRAINT "clinical_evolutions_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_evolutions" ADD CONSTRAINT "clinical_evolutions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_evolutions" ADD CONSTRAINT "draft_evolutions_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_evolutions" ADD CONSTRAINT "draft_evolutions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_evolutions" ADD CONSTRAINT "draft_evolutions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
