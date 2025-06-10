let students = [];
let selectedStudent = null;

const subjects = [
    'CI068', 'CI210', 'CI212', 'CI215', 'CI162', 'CI163', 'CI221', 'OPT',
    'CI055', 'CI056', 'CI057', 'CI062', 'CI065', 'CI165', 'CI211', 'OPT',
    'CM046', 'CI067', 'CI064', 'CE003', 'CI059', 'CI209', 'OPT', 'OPT',
    'CM045', 'CM005', 'CI237', 'CI058', 'CI061', 'CI218', 'OPT', 'OPT',
    'CM201', 'CM202', 'CI166', 'CI164', 'SA214', 'CI220', 'TG I', 'TG II'
];

function setStatus(status) {
    switch (status) {
        case 'Aprovado':
        case 'Dispensa de Disciplinas (com nota)':
            return 'approved';
        case 'Equivalência de Disciplina':
            return 'equivalence';
        case 'Reprovado por nota':
        case 'Reprovado por Frequência':
            return 'unapproved';
        case 'Cancelado':
            return 'canceled';
        case 'Matrícula':
            return 'registered';
        case 'Trancamento Administrativo':
        case 'Trancamento Total':
            return 'locked';
        default:
            return '';
    }
}

function addSubject(student, item) {
    student.subjects.push({
        name: item.NOME_ATIV_CURRIC,
        code: item.COD_ATIV_CURRIC,
        status: item.SITUACAO,
        innerStatus: setStatus(item.SITUACAO),
        frequency: item.FREQUENCIA,
        type: item.DESCR_ESTRUTURA,
        totalOfHours: item.CH_TOTAL,
        semester: item.PERIODO,
        finalGrade: item.MEDIA_FINAL,
        year: item.ANO
    });
}

function createStudent(item) {
    let student = {
        id: item.ID_CURSO_ALUNO,
        name: item.NOME_ALUNO,
        grr: item.MATR_ALUNO,
        course: item.NOME_CURSO,
        subjects: []
    };
    addSubject(student, item);
    return student;
}

function getTCC() {
    return {
        tcc1: selectedStudent.subjects.findLast(s => s.type == 'Trabalho de Graduação I'),
        tcc2: selectedStudent.subjects.findLast(s => s.type == 'Trabalho de Graduação II')
    };
}

function getOpt() {
    let temp = selectedStudent.subjects.filter(s =>
        s.type == 'Optativas' &&
        (s.innerStatus == 'approved' || s.innerStatus == 'registered' || s.innerStatus == 'equivalence')
    );
    return temp.slice(0, 6).reverse();
}

function treatXml(xml) {
    let localStudents = [];
    $(xml).find('ALUNO').each(function() {
        let item = {};
        $(this).children().each(function() {
            item[this.nodeName] = $(this).text();
        });
        let student = localStudents.find(s => s.grr == item.MATR_ALUNO);
        if (!student) {
            student = createStudent(item);
            localStudents.push(student);
        } else {
            addSubject(student, item);
        }
    });
    students = localStudents;
    selectedStudent = students[0];
}

function setLoadedStudents() {
    const studentsSelector = $('#students');
    let studentOptions = "";
    students.forEach(student => {
        studentOptions += `<option value="${student.grr}">${student.name} - ${student.grr}</option>`;
    });
    studentsSelector.html(studentOptions);
}

function setStudentInfo() {
    const studentInfo = $('#studentInfo');
    let temp = `
        <div class="d-flex flex-row mt-3">
            <span class="me-3"> Nome: ${selectedStudent.name} </span>
            <span> GRR: ${selectedStudent.grr} </span>
        </div>
    `;
    studentInfo.html(temp);
}

function showPopUp(code) {
    let tempSubject = selectedStudent.subjects.findLast(s => s.code == code);
    let html;
    if (!tempSubject) {
        html = `<h4>Sem histórico para ${code}</h4>`;
    } else {
        html = `
            <h4>${tempSubject.code} - ${tempSubject.name}</h4>
            <div>
                <b>Última vez cursada:</b> ${tempSubject.year}/${tempSubject.semester}<br>
                <b>Nota:</b> ${tempSubject.finalGrade}<br>
                <b>Frequência:</b> ${tempSubject.frequency}<br>
                <b>Status:</b> ${tempSubject.status}
            </div>
        `;
    }
    $('#popup-body').html(html);
    $('#popup').fadeIn(150);
}

// Fechar popup ao clicar no X ou fora do conteúdo
$(document).on('click', '#popup-close', function() {
    $('#popup').fadeOut(150);
});
$(document).on('click', '#popup', function(e) {
    if (e.target.id === 'popup') $('#popup').fadeOut(150);
});

function showHistory(code) {
    const history = $('#history');
    let subjects = selectedStudent.subjects.filter(s => s.code == code);
    if (!subjects.length) {
        history.html(`<h4>Sem histórico para ${code}</h4>`);
        return;
    }
    let temp = `<h4> Histórico de ${subjects[0].code}: </h4>`;
    temp += `<span> Nome: ${subjects[0].name} </span>`;
    temp += '<div class="history__wrapper">';
    subjects.forEach((subject, index) => {
        temp += `<div class="d-flex flex-column history__cell ${index != (subjects.length - 1) ? 'divisor' : ''}">`;
        temp += `<span>${index + 1}° vez</span>`;
        temp += `<span>Ano: ${subject.year}</span>`;
        temp += `<span>Semestre: ${subject.semester}</span>`;
        temp += `<span>Nota final: ${subject.finalGrade}</span>`;
        temp += `<span>Frequência: ${subject.frequency}</span>`;
        temp += `<span>Status: ${subject.status}</span>`;
        temp += '</div>';
    });
    temp += '</div>';
    history.html(temp);
}

function setStudentTable() {
    const grade = $('#grade');
    const numCols = 8;
    let gradeStruct = "<tr>";
    for (let count = 1; count <= numCols; ++count)
        gradeStruct += `<td class="grade__cell grade_header__cell">${count}º</td>`;
    gradeStruct += "</tr><tr class='header_divisor__wrapper'>";
    for (let count = 1; count <= numCols; ++count)
        gradeStruct += `<td class="header__divisor"></td>`;
    gradeStruct += "</tr><tr>";

    let tempTCC = getTCC();
    let tempOpt = getOpt();

    subjects.forEach((subject, index) => {
        let tempSubject = selectedStudent.subjects.findLast(s => s.code == subject);

        if (tempSubject == undefined) {
            let temp = tempOpt.pop();
            if (subject == 'OPT' && temp != undefined)
                gradeStruct += `<td class="grade__cell pointer ${temp.innerStatus}" oncontextmenu="showPopUp('${temp.code}');return false;" onclick="showHistory('${temp.code}')"><span> ${temp.code} </span></td>`;
            else if (subject == 'TG I' && tempTCC.tcc1 != undefined) {
                gradeStruct += `<td class="grade__cell pointer ${tempTCC.tcc1.innerStatus}" oncontextmenu="showPopUp('${tempTCC.tcc1.code}');return false;" onclick="showHistory('${tempTCC.tcc1.code}')"><span> ${tempTCC.tcc1.code} </span></td>`;
                tempOpt.push(temp);
            } else if (subject == 'TG II' && tempTCC.tcc2 != undefined) {
                gradeStruct += `<td class="grade__cell pointer ${tempTCC.tcc2.innerStatus}" oncontextmenu="showPopUp('${tempTCC.tcc2.code}');return false;" onclick="showHistory('${tempTCC.tcc2.code}')"><span> ${tempTCC.tcc2.code} </span></td>`;
                tempOpt.push(temp);
            } else {
                gradeStruct += `<td class="grade__cell pointer didNotAttended" oncontextmenu="showPopUp('${subject}');return false;" onclick="showHistory('${subject}')"><span> ${subject} </span></td>`;
                tempOpt.push(temp);
            }
        } else
            gradeStruct += `<td class="grade__cell pointer ${tempSubject.innerStatus}" oncontextmenu="showPopUp('${subject}');return false;" onclick="showHistory('${subject}')"><span> ${subject} </span></td>`;

        if (index % numCols == 7)
            gradeStruct += "</tr><tr>";
    });

    gradeStruct += "</tr>";
    grade.html(gradeStruct);
}

$(function() {
    // Carrega XML ao iniciar
    $.ajax({
        url: 't4/alunos.xml',
        dataType: 'xml',
        success: function(xml) {
            treatXml(xml);
            setLoadedStudents();
            setStudentInfo();
            setStudentTable();

            $('#students').on('change', function() {
                selectedStudent = students.find(student => student.grr == this.value);
                $('#history').html('');
                setStudentInfo();
                setStudentTable();
            });
        },
        error: function() {
            alert('Erro ao carregar XML. Rode em servidor local!');
        }
    });
    // Limpa histórico ao trocar aluno
    $('#history').html('');
});