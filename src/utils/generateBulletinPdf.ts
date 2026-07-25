// src/utils/generateBulletinPdf.ts
//
// Reusable "bulletin" (report card / course-completion certificate) PDF
// template for Usratul Azkaar. Feed it real course-completion data once a
// student finishes a level, or call downloadSampleBulletinPdf() to preview
// the template with placeholder data.
//
// All personal data below (SAMPLE_BULLETIN_DATA) is fictional placeholder
// content for previewing the template — it must never be replaced with a
// real student's actual grades/identity without their consent to generate
// their own document.

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface BulletinSubject {
    name: string;
    /** Student's average for this subject, or null if not yet evaluated (shown as "NC"). */
    studentAverage: number | null;
    classAverage: number;
    coefficient: number;
    rank: number | null;
    /** Absence time for this subject, e.g. "0h00". */
    absences?: string;
    appreciation?: string;
    teacher?: string;
}

export interface BulletinTrimesterSummary {
    label: string;
    studentAverage: number | null;
    classRank: number | null;
    classSize: number | null;
}

export interface BulletinData {
    schoolYear: string;
    /** e.g. "1er semestre", "2e trimestre". */
    periodLabel: string;
    studentName: string;
    studentId: string;
    birthDate?: string;
    birthPlace?: string;
    gender?: string;
    nationality?: string;
    className: string;
    classHeadcount?: number;
    classMaleCount?: number;
    classFemaleCount?: number;
    subjects: BulletinSubject[];
    overallAverage: number;
    classHighestAverage?: number;
    classLowestAverage?: number;
    classOverallAverage?: number;
    mainTeacher?: string;
    trimesterSummaries?: BulletinTrimesterSummary[];
    annualAverage?: number | null;
    conduct?: string;
    workRemark?: string;
    attendanceRemark?: string;
    principalName?: string;
    generatedAt?: Date;
}

const BRAND = {
    name: 'USRATUL AZKAAR',
    tagline: 'Digital Islamic Spiritual Practice',
    email: 'contact@usratulazkaar.com',
    whatsapp: '+228 90 00 00 00',
    gold: [212, 175, 55] as [number, number, number],
};

const fmt = (n: number | null | undefined, digits = 2) =>
    n === null || n === undefined || Number.isNaN(n) ? 'NC' : n.toFixed(digits);

/** Builds the bulletin as a jsPDF document (A4, portrait) without saving it. */
export function generateBulletinPdf(data: BulletinData): jsPDF {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 14;

    // ---- Header ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.gold);
    doc.text(BRAND.name, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(BRAND.tagline, margin, y + 4);
    doc.text(`${BRAND.email}  |  ${BRAND.whatsapp}`, margin, y + 8);

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Année scolaire : ${data.schoolYear}`, pageWidth - margin, y, { align: 'right' });

    y += 16;
    doc.setDrawColor(...BRAND.gold);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`BULLETIN — ${data.periodLabel.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(11);
    doc.text(`${data.studentName}  [ID : ${data.studentId}]`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    // ---- Identity block ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const leftCol = margin;
    const rightCol = pageWidth / 2 + 4;
    const identityLines: [string, string][] = [
        [`Né(e) le : ${data.birthDate ?? '—'}`, `Lieu de naissance : ${data.birthPlace ?? '—'}`],
        [`Classe : ${data.className}`, `Effectif : ${data.classHeadcount ?? '—'}` +
            (data.classMaleCount !== undefined && data.classFemaleCount !== undefined
                ? `  (M : ${data.classMaleCount} | F : ${data.classFemaleCount})`
                : '')],
        [`Sexe : ${data.gender ?? '—'}`, `Nationalité : ${data.nationality ?? '—'}`],
    ];
    for (const [left, right] of identityLines) {
        doc.text(left, leftCol, y);
        doc.text(right, rightCol, y);
        y += 5;
    }
    y += 3;

    // ---- Subjects table ----
    const totalCoef = data.subjects.reduce((sum, s) => sum + s.coefficient, 0);
    const totalWeighted = data.subjects.reduce(
        (sum, s) => sum + (s.studentAverage ?? 0) * s.coefficient, 0
    );

    autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Discipline', 'Moy. Apprenant', 'Moy. Classe', 'Coef', 'Note x Coef', 'Rang', 'Absences', 'Appréciation', 'Professeur']],
        body: data.subjects.map(s => [
            s.name,
            fmt(s.studentAverage),
            fmt(s.classAverage),
            String(s.coefficient),
            fmt((s.studentAverage ?? 0) * s.coefficient),
            s.rank !== null ? String(s.rank) : 'NC',
            s.absences ?? '0h00',
            s.appreciation ?? '—',
            s.teacher ?? '—',
        ]),
        foot: [['TOTAUX', '', '', String(totalCoef), fmt(totalWeighted), '', '', `Moyenne : ${fmt(data.overallAverage)}`, '']],
        headStyles: { fillColor: BRAND.gold, textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8 },
        footStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        styles: { cellPadding: 1.5, lineColor: [200, 200, 200], lineWidth: 0.1 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // ---- Bilan ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('BILAN', pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Moyenne la plus forte : ${fmt(data.classHighestAverage)}`, leftCol, y);
    doc.text(`Professeur principal : ${data.mainTeacher ?? '—'}`, rightCol, y);
    y += 5;
    doc.text(`Moyenne la plus faible : ${fmt(data.classLowestAverage)}`, leftCol, y);
    y += 5;
    doc.text(`Moyenne de la classe : ${fmt(data.classOverallAverage)}`, leftCol, y);
    y += 8;

    if (data.trimesterSummaries?.length) {
        autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [['Période', 'Moyenne', 'Rang', 'Effectif classe']],
            body: data.trimesterSummaries.map(t => [
                t.label,
                fmt(t.studentAverage),
                t.classRank !== null ? String(t.classRank) : '—',
                t.classSize !== null ? String(t.classSize) : '—',
            ]),
            headStyles: { fillColor: BRAND.gold, textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            styles: { cellPadding: 1.5 },
        });
        y = (doc as any).lastAutoTable.finalY + 6;
    }

    if (data.annualAverage !== undefined) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Moyenne annuelle : ${fmt(data.annualAverage)}`, leftCol, y);
        y += 8;
    }

    // ---- Appreciation / decision ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('APPRÉCIATION OU DÉCISION DU CONSEIL DE CLASSE', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Conduite : ${data.conduct ?? '—'}`, leftCol, y);
    doc.text(`Travail : ${data.workRemark ?? '—'}`, pageWidth / 2, y);
    y += 5;
    doc.text(`Fréquentation : ${data.attendanceRemark ?? '—'}`, leftCol, y);
    y += 16;

    // ---- Signature ----
    doc.setFont('helvetica', 'bold');
    doc.text('Le Directeur,', pageWidth - margin - 40, y, { align: 'center' });
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.text(data.principalName ?? '—', pageWidth - margin - 40, y, { align: 'center' });

    // ---- Footer ----
    const generatedAt = data.generatedAt ?? new Date();
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(
        `Document généré par ${BRAND.name} le ${generatedAt.toLocaleDateString('fr-FR')} à ${generatedAt.toLocaleTimeString('fr-FR')} — ID : ${data.studentId}`,
        margin,
        doc.internal.pageSize.getHeight() - 10
    );

    return doc;
}

/** Generates and immediately triggers a browser download of the bulletin. */
export function downloadBulletinPdf(data: BulletinData, filename?: string): void {
    const doc = generateBulletinPdf(data);
    doc.save(filename ?? `bulletin-${data.studentId}.pdf`);
}

/**
 * Fictional placeholder data for previewing the template — NOT a real
 * student's record. Use this to sanity-check the layout before wiring in
 * real course-completion data.
 */
export const SAMPLE_BULLETIN_DATA: BulletinData = {
    schoolYear: '2025-2026',
    periodLabel: '1er semestre',
    studentName: 'Amina KONE',
    studentId: 'USRA-0000000001',
    birthDate: '01-01-2010',
    birthPlace: 'Lomé',
    gender: 'Féminin',
    nationality: 'Togolaise',
    className: 'Niveau 2 — Azkaar',
    classHeadcount: 24,
    classMaleCount: 11,
    classFemaleCount: 13,
    subjects: [
        { name: 'Azkaar & Awraad', studentAverage: 14.5, classAverage: 12.8, coefficient: 4, rank: 3, teacher: '—' },
        { name: 'Tazkiyah', studentAverage: 13.2, classAverage: 12.1, coefficient: 3, rank: 5, teacher: '—' },
        { name: 'Tafsir', studentAverage: 11.8, classAverage: 11.5, coefficient: 3, rank: 9, teacher: '—' },
        { name: 'Ruqyah & Protection', studentAverage: null, classAverage: 10.9, coefficient: 2, rank: null, teacher: '—' },
    ],
    overallAverage: 12.9,
    classHighestAverage: 15.4,
    classLowestAverage: 8.2,
    classOverallAverage: 11.6,
    mainTeacher: '—',
    trimesterSummaries: [
        { label: '1er trimestre', studentAverage: 12.9, classRank: 5, classSize: 24 },
        { label: '2e trimestre', studentAverage: null, classRank: null, classSize: null },
        { label: '3e trimestre', studentAverage: null, classRank: null, classSize: null },
    ],
    annualAverage: null,
    conduct: 'Bonne',
    workRemark: 'Sérieux et assidu(e)',
    attendanceRemark: 'Régulière',
    principalName: '—',
};

/** Convenience helper to preview the template with sample data. */
export function downloadSampleBulletinPdf(): void {
    downloadBulletinPdf(SAMPLE_BULLETIN_DATA, 'bulletin-exemple.pdf');
}
