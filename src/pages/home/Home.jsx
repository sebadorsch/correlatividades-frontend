import React, {useEffect, useState} from 'react';
import PageContainer from 'src/components/PageContainer/PageContainer.js';
import { useAuth } from 'src/contexts/GeneralContext.js';
import {postUsersSubjects} from "src/services/submitUsersSubjects.js";
import {getMe} from "src/services/getMe.js";
import LoadingAnimation from "src/components/LoadingAnimation.js";

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

  return (
    <PageContainer>
      {!subjects ? (
        <LoadingAnimation />
      ) : (
        <>
          <table className="table table-striped">
            <thead>
            <tr>
              <th>Año</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Cursado</th>
              <th>C.H. semanal</th>
              <th>C.H. anual</th>
              <th>Regular</th>
              <th>Aprobada</th>
              <th>Necesita Regular</th>
              <th>Necesita Aprobada</th>
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
                  {renderCell(
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
                  {renderCell(
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
                  {renderCell(requiredSubjectsToEnroll.length > 0 ? requiredSubjectsToEnroll.join(' - ') : '-', subject, 'text-center')}
                  {renderCell(requiredSubjectsToPass.length > 0 ? requiredSubjectsToPass.join(' - ') : '-', subject, 'text-center')}
                </tr>
              );
            })}
            </tbody>
          </table>
          {
            user &&
            <div className="mt-5 text-end">
              <button className="btn btn-primary" onClick={handleSubmit}>
                Actualizar valores
              </button>
            </div>
          }
        </>
      )}
    </PageContainer>
  );
}
