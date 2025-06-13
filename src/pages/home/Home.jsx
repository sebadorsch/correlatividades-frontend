import React, {useEffect, useRef, useState} from 'react';
import PageContainer from 'src/components/PageContainer/PageContainer.js';
import { useAuth } from 'src/contexts/GeneralContext.js';
import {postUsersSubjects} from "src/services/submitUsersSubjects.js";
import LoadingAnimation from "src/components/LoadingAnimation.js";
import {getSubjectsUserCanEnroll} from "src/services/getSubjectsUserCanEnroll.js";

const termTypeMap = {
  CUATRIMESTRAL: 'CUATR',
  ANUAL: 'ANUAL',
};

const formatTermType = (termType) => termTypeMap[termType?.toUpperCase()] || termType;

export default function Home() {
  const { subjects, currentUser: user } = useAuth();
  const [selectedRow, setSelectedRow] = useState(null);
  const [requiredToEnrollCodes, setRequiredToEnrollCodes] = useState([]);
  const [requiredToPassCodes, setRequiredToPassCodes] = useState([]);

  const [regularizedSubjectsChecked, setRegularizedSubjectsChecked] = useState([]);
  const [approvedSubjectsChecked, setApprovedSubjectsChecked] = useState([]);

  const tableRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setSelectedRow(null);
        setRequiredToEnrollCodes([]);
        setRequiredToPassCodes([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCheckboxChange = (subjectCode, type) => {
    if (type === 'regularized') {
      setRegularizedSubjectsChecked((prev) =>
        prev.includes(subjectCode)
          ? prev.filter(code => code !== subjectCode)
          : [...prev, subjectCode]
      );
    } else if (type === 'approved') {
      setApprovedSubjectsChecked((prev) =>
        prev.includes(subjectCode)
          ? prev.filter(code => code !== subjectCode)
          : [...prev, subjectCode]
      );
    }
  };

  const handleRowClick = (subject) => {
    setSelectedRow(subject.id);
    setRequiredToEnrollCodes(subject.requiredSubjectsToEnroll || []);
    setRequiredToPassCodes(subject.requiredSubjectsToPass || []);
  };

  const renderCell = (value, subject, extraClasses = '') => {
    const isSelected = selectedRow === subject.id;
    const isRequiredToEnroll = requiredToEnrollCodes.includes(subject.code);
    const isRequiredToPass = requiredToPassCodes.includes(subject.code);

    const bgClass = isSelected
      ? 'bg-danger text-white'
      : isRequiredToEnroll
        ? 'bg-warning'
        : isRequiredToPass
          ? 'bg-success text-white'
          : '';

    return (
      <td className={`${bgClass} ${extraClasses}`.trim()}>
        {value}
      </td>
    );
  };

  const handleSubmit = async () => {
    try {
      const data = await postUsersSubjects({
        regularizedSubjects: regularizedSubjectsChecked,
        approvedSubjects: approvedSubjectsChecked
      });
      window.location.reload();
      const {regularizedSubjects, approvedSubjects} = data;
      setRegularizedSubjectsChecked(regularizedSubjects);
      setApprovedSubjectsChecked(approvedSubjects)
    } catch (error) {
      console.log('Ocurrió un error al enviar los datos', error);
    }
  };

  useEffect(() => {
    if (user) {
      setRegularizedSubjectsChecked(user.regularizedSubjects || []);
      setApprovedSubjectsChecked(user.approvedSubjects || []);
    }
  }, [user]);

  useEffect(() => {
    if (user && subjects) {
      const availableSubjects = getSubjectsUserCanEnroll(subjects, user);
      console.log('Materias que el usuario puede cursar:', availableSubjects);
    }
  }, [user, subjects]);

  return (
    <PageContainer>
      {!subjects ? (
        <LoadingAnimation />
      ) : (
        <>
          <table ref={tableRef} className="table table-striped">
            <thead>
            <tr>
              <th>Año</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Cursado</th>
              <th>C.H. semanal</th>
              <th>C.H. anual</th>
              <th>Necesita Regular</th>
              <th>Necesita Aprobada</th>
              {user && <th>Regular</th>}
              {user && <th>Aprobada</th>}
            </tr>
            </thead>
            <tbody className="table-group-divider">
            {subjects.map((subject) => {
              const {
                id,
                courseYear,
                code,
                name,
                termType,
                weeklyHours,
                annualHours,
                requiredSubjectsToEnroll,
                requiredSubjectsToPass,
              } = subject;

              return (
                <tr
                  key={id}
                  onClick={() => handleRowClick(subject)}
                  className='cursor-pointer'
                >
                  {renderCell(courseYear, subject)}
                  <th
                    className={
                      selectedRow === id
                        ? 'bg-danger text-white text-center'
                        : requiredToEnrollCodes.includes(code)
                          ? 'bg-warning text-center'
                          : requiredToPassCodes.includes(code)
                            ? 'bg-success text-white text-center'
                            : 'text-center'
                    }
                    scope="row"
                  >
                    {code}
                  </th>
                  {renderCell(name, subject )}
                  {renderCell(formatTermType(termType), subject, 'text-center')}
                  {renderCell(weeklyHours, subject, 'text-center')}
                  {renderCell(annualHours, subject, 'text-center')}
                  {renderCell(requiredSubjectsToEnroll.length > 0 ? requiredSubjectsToEnroll.join(' - ') : '-', subject, 'text-center')}
                  {renderCell(requiredSubjectsToPass.length > 0 ? requiredSubjectsToPass.join(' - ') : '-', subject, 'text-center')}
                  {user && renderCell(
                    <div className="form-check d-flex justify-content-center">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={regularizedSubjectsChecked.includes(subject.code)}
                        onChange={() => handleCheckboxChange(subject.code, 'regularized')}
                      />
                    </div>,
                    subject,
                    'text-center'
                  )}
                  {user && renderCell(
                    <div className="form-check d-flex justify-content-center">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={approvedSubjectsChecked.includes(subject.code)}
                        onChange={() => handleCheckboxChange(subject.code, 'approved')}
                      />
                    </div>,
                    subject,
                    'text-center'
                  )}
                </tr>
              );
            })}
            </tbody>
          </table>
          {
            user &&
            <div className="mt-5 text-end">
              <button className="btn btn-primary" onClick={handleSubmit}>
                Guardar valores
              </button>
            </div>
          }
          {
            user &&
            <>
              <h2 className="mt-5">Materias que podés cursar</h2>
              <table className="table table-striped">
                <thead>
                <tr>
                  <th>Año</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Cursado</th>
                  <th>C.H. semanal</th>
                  <th>C.H. anual</th>
                  <th>Necesita Regular</th>
                  <th>Necesita Aprobada</th>
                </tr>
                </thead>
                <tbody className="table-group-divider">
                {getSubjectsUserCanEnroll(subjects, user).map((subject) => (
                  <tr key={subject.id}>
                    <td>{subject.courseYear}</td>
                    <td>{subject.code}</td>
                    <td>{subject.name}</td>
                    <td className="text-center">{formatTermType(subject.termType)}</td>
                    <td className="text-center">{subject.weeklyHours}</td>
                    <td className="text-center">{subject.annualHours}</td>
                    <td className="text-center">
                      {subject.requiredSubjectsToEnroll.length > 0
                        ? subject.requiredSubjectsToEnroll.join(' - ')
                        : '-'}
                    </td>
                    <td className="text-center">
                      {subject.requiredSubjectsToPass.length > 0
                        ? subject.requiredSubjectsToPass.join(' - ')
                        : '-'}
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </>
          }
        </>
      )}
    </PageContainer>
  );
}
