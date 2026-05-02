import React, { useEffect, useState } from "react";

export default function Grades() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [evaluationType, setEvaluationType] = useState("EXAM");
  const [semester, setSemester] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

    fetch('/grades/subjects', { headers })
      .then((r) => { if (r.status === 401) throw new Error('unauth'); return r.json() })
      .then(setSubjects)
      .catch(() => setSubjects([]));

    fetch('/grades/programs', { headers })
      .then((r) => { if (r.status === 401) throw new Error('unauth'); return r.json() })
      .then(setPrograms)
      .catch(() => setPrograms([]));
  }, []);

  useEffect(() => {
    if (!selectedProgram) return;
    const token = localStorage.getItem('token');
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`/grades/levels?programId=${selectedProgram}`, { headers })
      .then((r) => { if (r.status === 401) throw new Error('unauth'); return r.json() })
      .then(setLevels)
      .catch(() => setLevels([]));
  }, [selectedProgram]);

  useEffect(() => {
    if (!selectedProgram || !selectedLevel) return;
    const token = localStorage.getItem('token');
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`/grades/students?programId=${selectedProgram}&levelId=${selectedLevel}`, { headers })
      .then((r) => { if (r.status === 401) throw new Error('unauth'); return r.json() })
      .then(setStudents)
      .catch(() => setStudents([]));
  }, [selectedProgram, selectedLevel]);

  function updateGrade(studentId: string, value: number) {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, _grade: value } : s)),
    );
  }

  function save() {
    const payload = {
      subjectId: selectedSubject,
      programId: selectedProgram,
      levelId: selectedLevel,
      evaluationType,
      semester: Number(semester),
      grades: students.map((s) => ({
        studentId: s.id,
        value: Number(s._grade || 0),
      })),
    };

    const token = localStorage.getItem('token');
    const headers: any = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };

    fetch('/grades', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
      .then((r) => { if (r.status === 401) throw new Error('unauth'); return r.json() })
      .then((res) => alert('Saved ' + (res?.length || 0) + ' grades'))
      .catch((err) => alert('Save failed'));
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Module des notes</h2>

      <div style={{ marginBottom: 10 }}>
        <label>Matière: </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">-- Choisir --</option>
          {subjects.map((s: any) => {
            const name = s.subject ? s.subject.name : s.name;
            const id = s.subject ? s.subject.id : s.id;
            return (
              <option key={s.id ?? id} value={id}>
                {name}
              </option>
            );
          })}
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Filière (Program): </label>
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
        >
          <option value="">-- Choisir --</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.level})
            </option>
          ))}
        </select>

        <label style={{ marginLeft: 10 }}>Niveau (Level): </label>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
        >
          <option value="">-- Choisir --</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Type d'évaluation: </label>
        <select
          value={evaluationType}
          onChange={(e) => setEvaluationType(e.target.value)}
        >
          <option value="EXAM">Examen</option>
          <option value="TP">TP</option>
        </select>

        <label style={{ marginLeft: 10 }}>Semestre: </label>
        <input
          type="number"
          value={semester}
          onChange={(e) => setSemester(Number(e.target.value))}
          style={{ width: 60 }}
        />
      </div>

      <table border={1} cellPadding={6} cellSpacing={0}>
        <thead>
          <tr>
            <th>Matricule</th>
            <th>Nom</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.matricule}</td>
              <td>
                {s.user?.firstName} {s.user?.lastName}
              </td>
              <td>
                <input
                  type="number"
                  value={s._grade ?? ""}
                  onChange={(e) => updateGrade(s.id, Number(e.target.value))}
                  style={{ width: 80 }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10 }}>
        <button onClick={save}>Enregistrer les notes</button>
      </div>
    </div>
  );
}
