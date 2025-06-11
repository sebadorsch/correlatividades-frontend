import React, {useEffect, useState} from 'react';
import PageContainer from 'src/components/PageContainer/PageContainer.js';
import { useAuth } from 'src/contexts/GeneralContext.js';

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

  return (
    <PageContainer>
      {!subjects ? (
        <p>Loading subjects...</p>
      ) : (
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
                {renderCell( user?.regularizedSubjects.includes(subject.code) ? '✓' : '', subject, 'text-center')}
                {renderCell( user?.approvedSubjects.includes(subject.code) ? '✓' : '', subject, 'text-center')}
                {renderCell(requiredSubjectsToEnroll.length > 0 ? requiredSubjectsToEnroll.join(' - ') : '-', subject, 'text-center')}
                {renderCell(requiredSubjectsToPass.length > 0 ? requiredSubjectsToPass.join(' - ') : '-', subject, 'text-center')}
              </tr>
            );
          })}
          </tbody>
        </table>
      )}
    </PageContainer>
  );
}
