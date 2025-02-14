"use-strict";

const addStudentInput = document.getElementById("add-student-name");
const modifyStudentInput = document.getElementById("modify-student-name");
const deleteStudentInput = document.getElementById("delete-student");
const listStudentsAggrButton = document.getElementById("aggregate-order");
const listStudentsAlphButton = document.getElementById("alphabetic-order");
const studentAverageByNameButton = document.getElementById("one-student-average-button");
const studentAverageByRangeButton = document.getElementById("range-student-average-button");

const addStudentSendButton = document.getElementById("add-student__send-button");
const modifyStudentSendButton = document.getElementById("modify-student__send-button");
const deleteStudentSendButton = document.getElementById("delete-student__send-button");


const optionsSection = document.querySelector(".options-section");
const studentsSection = document.querySelector(".students-section");

const addStudentIconSection = document.getElementById("add-student__icon-section");
const addStudentInputSection = document.getElementById("add-student__input-section");

const modifyStudentIconSection = document.getElementById("modify-student__icon-section");
const modifyStudentInputSection = document.getElementById("modify-student__input-section");

const deleteStudentIconSection = document.getElementById("delete-student__icon-section");
const deleteStudentInputSection = document.getElementById("delete-student__input-section");

const listStudentsIconSection = document.getElementById("list-students__icon-section");
const listStudentsInputSection = document.getElementById("list-students__input-section");

const studentAverageIconSection = document.getElementById("student-average__icon-section");
const studentAverageInputSection = document.getElementById("student-average__input-section");


const addStudentMessageSection = document.getElementById("add-student__message-section");
const modifyStudentMessageSection = document.getElementById("modify-student__message-section");
const deleteStudentMessageSection = document.getElementById("delete-student__message-section");
const listStudentsMessageSection = document.getElementById("list-students__message-section");
const studentAverageByNameMessageSection = document.getElementById("one-student-average__message-section");
const studentAverageByRangeMessageSection = document.getElementById("range-student-average__message-section");


const studentsSectionTitle = document.querySelector(".students-section__title");
const studentsSectionStudentContainer = document.querySelector(".students-section__student-container");


// FUNCIONES VISUALES

/* Anteriormente tenía un problema con "isSectionClicked" (es decir, addStudentIconSectionClicked y los demás) ya que pasaba el valor "isSectionClicked" como un argumento a la función, pero este valor no se actualiza fuera del ámbito de esa función. Los cambios que le hacía a "isSectionClicked" dentro de la función no afectan la variable "isSectionClicked" en el ámbito global. El problema surge porque en JS, cuando se pasa una variable primitiva (como un booleano) a una función, se pasa por valor, no por referencia. Esto significa que la función recibe una copia de la variable, no la variable en sí.
Dentro de la Función:
- La función revisaba el valor de "isSectionClicked", que era false.
- Cambiaba el estilo de inputSection.
- Luego cambiaba el valor de "isSectionClicked" a true, pero solo en el contexto de la función.
Al salir de la Función:
- "isSectionClicked" fuera de la función sigue siendo false porque la función solo cambió la copia, no la variable original.

Solución: Actualizar directamente la variable global dentro del event listener, o 
utilizar un objeto para almacenar los estados de cada sección, ya que los objetos 
se pasan por referencia y permiten que los cambios se reflejen fuera de la función. */

let isAnimating = false;

const toggleInputSection = (iconSection,inputSection)=>{
    // Usando un flag que indica si una animación está en curso y bloquea nuevos clicks hasta que la animación se haya completado para evitar que los elementos se inserten en el orden incorrecto en el DOM debido a la naturaleza asincrónica de los setTimeout al hacer click en dos iconos en rápida sucesión ya que el primer icono todavía está en proceso de animación cuando el segundo icono comienza su propio proceso de animación.
    if (isAnimating) return; // Si hay una animación en curso, no se hace nada
    isAnimating = true; // Animación en curso

    // Para solucionar el problema ahora use clases.
    let isSectionClicked = inputSection.classList.contains("visible");

    let options = optionsSection.querySelector(".options-section__options");
    let optionsExpanded = optionsSection.querySelector(".options-section__options-expanded");
    let option = iconSection.parentElement;
    let iconSectionTitle = option.querySelector(".icon-section__title");

    if (isSectionClicked) {
        // pointerEvents deshabilita los eventos del puntero en iconSection y inputSection
        iconSection.style.pointerEvents = "none";
        inputSection.style.pointerEvents = "none";

        iconSection.classList.add("active");

        closeSection(inputSection, true);

        setTimeout(() => {
            iconSection.classList.remove("active");
            iconSectionTitle.classList.remove("visible");

            // Rehabilitando los eventos del puntero y dejando el translate en 0 después de la transición.
            iconSection.removeAttribute("style");
            inputSection.removeAttribute("style");

            optionsExpanded.removeChild(option);  
            options.appendChild(option);

            isAnimating = false; // Animación completa, permitir nuevos clicks
        }, 700);

        // PARA CERRAR LA SECCIÓN QUE ABREN LOS studentAverageButtons SI ESTÁ ABIERTA AL CERRAR EL iconSection.
        if (iconSection == studentAverageIconSection) {
            removeStudentAverageSectionElements(studentAverageByNameButton);
            removeStudentAverageSectionElements(studentAverageByRangeButton);
        }
    } else {
        option.parentElement.removeChild(option);
        optionsExpanded.appendChild(option);
        
        iconSection.classList.add("active");
        
        setTimeout(() => {
            iconSection.classList.remove("active");
            
            inputSection.classList.add("visible");
            iconSectionTitle.classList.add("visible");
            
            isAnimating = false; // Animación completa, permitir nuevos clicks
        }, 10);
    }
}


addStudentIconSection.addEventListener("click",()=>{
    toggleInputSection(addStudentIconSection,addStudentInputSection);
})

modifyStudentIconSection.addEventListener("click",()=>{
    toggleInputSection(modifyStudentIconSection,modifyStudentInputSection);
})

deleteStudentIconSection.addEventListener("click",()=>{
    toggleInputSection(deleteStudentIconSection,deleteStudentInputSection);
})

listStudentsIconSection.addEventListener("click",()=>{
    toggleInputSection(listStudentsIconSection,listStudentsInputSection);
})

studentAverageIconSection.addEventListener("click",()=>{
    toggleInputSection(studentAverageIconSection,studentAverageInputSection);
})



// BASE DE DATOS Y FUNCIONALIDADES

const IDBRequest = indexedDB.open("database",1);


IDBRequest.addEventListener("upgradeneeded",()=>{
    console.log("La base de datos se creó correctamente");
    const db = IDBRequest.result;
    db.createObjectStore("students",{
        autoIncrement: true
    });
})

IDBRequest.addEventListener("success",()=>{
    // readObjects();                     // console.log("La base de datos se abrió correctamente")
    // countRequest = getIDBData().count();
})

IDBRequest.addEventListener("error",()=>{
    console.log("Ocurrió un error al abrir la base de datos");
})


const getIDBData = (mode,msg) =>{
    const db = IDBRequest.result;
    const IDBtransaction = db.transaction("students",mode);
    const objectStore = IDBtransaction.objectStore("students");
    IDBtransaction.addEventListener("complete",()=>{
        if (msg) console.log(msg);
    })
    return objectStore;
}


const addObject = object => {
    const IDBData = getIDBData("readwrite","Estudiante agregado correctamente");
    IDBData.add(object);
}

// ACA IBA EL READOBJECTS

const modifyObject = (object,key) => {
    const IDBData = getIDBData("readwrite","Estudiante modificado correctamente");
    IDBData.put(object,key);
}

const deleteObject = key => {
    const IDBData = getIDBData("readwrite","Estudiante eliminado correctamente");
    IDBData.delete(key);
}


// FUNCIONALIDAD DE LA PÁGINA


const createEnterInputEvent = input =>{
    input.addEventListener("keyup", e=>{
        if (e.key == "Enter" || e.keyCode == "13") { // Verificando si la tecla que se presiono y solto en el input es "Enter"
            const clickEvent = new Event("click"); // Creando un evento de click
            const sendButton = e.target.closest(".input-section__main-section").nextElementSibling;
            sendButton.dispatchEvent(clickEvent); // Lanzando el evento de click en el botón de enviar y desencadenando que se ejecute el callback
        }
    })
}

let inputSectionInputs = document.querySelectorAll(".input-section__input");
inputSectionInputs.forEach(input => {
    createEnterInputEvent(input);
});


let iconSectionLabels = document.querySelectorAll("label");
iconSectionLabels.forEach(label=>{
    label.addEventListener("click",e=>{
        e.stopPropagation();
    })
})


let name, age, qualificationsAmount;
let addStudentIndex = 1;
let qualifications = [];

addStudentSendButton.addEventListener("click",()=>{
    if (addStudentInput.id == "add-student-name") {
        if (validateStudentName()[0]) {
            console.log("NOMBRE ingresado correctamente.");
            name = configureStudentName(validateStudentName()[1]);
            console.log(name, typeof name); // LUEGO SACAR ESTA LINEA
            modifyFormElementsToAge();
        } 
        else console.log("Se ha ingresado un NOMBRE inválido.");
    } 
    
    else if (addStudentInput.id == "add-student-age") {
        if (validateStudentAge()[0]) {
            console.log("EDAD ingresada correctamente.");
            age = validateStudentAge()[1];
            console.log(age, typeof age); // LUEGO SACAR ESTA LINEA
            modifyFormElementsToQualificationsAmount(addStudentInput,"add-student-qualifications-amount", addStudentSendButton);
        } 
        else console.log("Se ha ingresado una EDAD inválida.");
    } 
    
    else if (addStudentInput.id == "add-student-qualifications-amount") {
        if (validateStudentQualificationsAmount(addStudentInput, addStudentMessageSection)[0]) {
            console.log("CANTIDAD DE CALIFICACIONES ingresada correctamente.");
            qualificationsAmount = validateStudentQualificationsAmount(addStudentInput, addStudentMessageSection)[1];
            console.log(qualificationsAmount, typeof qualificationsAmount); // LUEGO SACAR ESTA LINEA
            modifyFormElementsToQualifications(addStudentInput, "add-student-qualifications", addStudentIndex, addStudentSendButton);
        } 
        else console.log("Se ha ingresado una CANTIDAD DE CALIFICACIONES inválida.");
    } 
    
    else if (addStudentInput.id == "add-student-qualifications") {
        console.log(age, name, qualificationsAmount);
        // Antes del cambio, la condición index <= qualificationsAmount se evaluaba antes de validar la calificación, lo que causaba que la última calificación no se agregara al array qualifications si index ya superaba qualificationsAmount en la última iteración. Cambiar el orden de las condiciones asegura que todas las calificaciones válidas se procesen correctamente antes de verificar si se ha alcanzado la cantidad total de calificaciones.
        if (validateStudentQualOrAver(addStudentInput, addStudentMessageSection, QUALIFICATION)[0]) {
            console.log(`CALIFICACIÓN NROº${addStudentIndex} ingresada correctamente.`);
            let qualification = validateStudentQualOrAver(addStudentInput, addStudentMessageSection, QUALIFICATION)[1];
            qualifications.push(qualification);
            console.log(qualification, typeof qualification); // LUEGO SACAR ESTA LINEA
            console.log(qualifications, addStudentIndex, qualificationsAmount); // LUEGO SACAR ESTA LINEA
            addStudentIndex++;
            
            if (addStudentIndex <= qualificationsAmount) {
                modifyFormElementsToQualifications(addStudentInput, "add-student-qualifications", addStudentIndex, addStudentSendButton);
            } else {
                addObject(addStudent(name, age, qualifications));
                resetFormElementsToName(addStudentInput, "add-student-name", addStudentSendButton);
                createSuccessMessage("Estudiante agregado éxitosamente.", addStudentMessageSection);
                addStudentIndex = 1;
                qualifications.length = 0;
            }
        } 
        else console.log(`La CALIFICACIÓN NROº${addStudentIndex} es inválida.`);
    }
})





const getStudentsAmount = () => {
    return new Promise((resolve, reject) => {
        // Con IDBRequest.readyState === "done": Verificar el estado readyState te asegura que la solicitud ha terminado, lo que es una señal clara de que puedes proceder a trabajar con el resultado.
        // Con IDBRequest.addEventListener("success", ...): Aunque el evento success te avisa cuando la solicitud se completa exitosamente, el acceso al resultado podría estar sujeto a los ciclos de eventos y la sincronización. Puede haber un pequeño retraso antes de que el resultado esté disponible para su uso.
        if (IDBRequest.readyState === "done") {
            let countRequest = getIDBData("readonly").count();
            countRequest.addEventListener("success", () => {
                resolve(countRequest.result);
            });
        }
    });
};


// ACA IBA EL READOBJECTS
const MODE_COMPARE_VALUES = "compareValues";
const MODE_COMPARE_AND_ADD = "compareAndAdd";
const MODE_ADD_VALUES = "addValues";

const readObjects = async (mode, inputValue) => {
    
    const count = await getStudentsAmount();

    return new Promise((resolve, reject) => {
        let studentsAmount = count;
        console.log(studentsAmount, typeof studentsAmount);

        if (studentsAmount === 0) {
            resolve([null, 1]);  // Resuelve la promesa con null si no hay datos
        } else {
            const IDBData = getIDBData("readonly");
            const cursor = IDBData.openCursor();
            let studentsList = [];

            cursor.addEventListener("success", () => {
                if (cursor.result) {
                    const { name: nameDB, age: ageDB, qualifications: qualificationsDB } = cursor.result.value;
                    const { key: keyDB } = cursor.result;

                    console.log(nameDB, ageDB, qualificationsDB, keyDB);

                    if (mode === MODE_COMPARE_VALUES) {
                        if (inputValue === nameDB) {
                            console.log(`El nombre ${inputValue} COINCIDE con un nombre guardado en la base de datos.`);

                            studentsList.push([nameDB, ageDB, keyDB, qualificationsDB]);
                        } else {
                            console.log(`El nombre ${inputValue} NO COINCIDE con el nombre ${nameDB} guardado en la base de datos.`);
                        }
                        cursor.result.continue();
                    } 

                    else if (mode === MODE_COMPARE_AND_ADD) {
                        let qualifications;

                        if (Array.isArray(inputValue)) {
                            qualifications = inputValue;
                        }
                        else {
                            qualifications = qualificationsDB;
                        }

                        let qualificationsTotal = 0;

                        for (let i = 0; i < qualifications.length; i++) {
                            qualificationsTotal += qualifications[i];
                        }

                        let qualificationsAverage = qualificationsTotal / qualifications.length;

                        console.log(qualifications, inputValue);
                        console.log("qualificationsTotal: ", qualificationsTotal);
                        console.log("qualificationsAverage: ", qualificationsAverage);

                        if (Array.isArray(inputValue)) {
                            qualificationsAverage = processQualAver(qualificationsAverage);

                            studentsList.push(qualificationsAverage);
                            resolve(studentsList);
                        } else {
                            if (inputValue <= qualificationsAverage) {
                                qualificationsAverage = processQualAver(qualificationsAverage);
                                studentsList.push([nameDB, keyDB, qualificationsAverage]);
                            }
                            cursor.result.continue();
                        }
                    } 

                    else if (mode === MODE_ADD_VALUES) {
                        studentsList.push([nameDB, keyDB]);
                        console.log(studentsList, studentsList.length);
                        cursor.result.continue();
                    }

                } else {
                    console.log("Todos los datos fueron leídos");
                    switch (mode) {
                        case MODE_COMPARE_VALUES:
                            if (studentsList.length !== 0) {
                                resolve(studentsList);
                            }
                            else {
                                resolve([null, 2]);  // Resuelve la promesa con null si no hay coincidencias
                            }
                            break;
                        case MODE_COMPARE_AND_ADD:
                        case MODE_ADD_VALUES:
                            resolve(studentsList);
                    }
                }
            })
        }
    })
}

const processQualAver = (qualificationsAverage)=>{
    let qualAverProcessed = qualificationsAverage.toString();

    if (/\.\d\b/.test(qualAverProcessed)) qualAverProcessed = parseFloat(qualAverProcessed).toFixed(1);
    else if (/\.\d{2,}/.test(qualAverProcessed)) qualAverProcessed = parseFloat(qualAverProcessed).toFixed(2);
    else return qualificationsAverage;

    return qualAverProcessed;
}



const selectStudent = (studentsList, input) => {
    return new Promise((resolve)=>{
        console.log(studentsList);
        const overlay = document.querySelector(".overlay");
        const selectStudentSection = document.querySelector(".select-student-section");
        const selectStudentStudentsSection = document.querySelector(".select-student__students");
        const fragment = document.createDocumentFragment();

        selectStudentStudentsSection.replaceChildren();

        for (let i = 0; i < studentsList.length; i++) {
            const studentSection = document.createElement("div");
            studentSection.classList.add("select-student__student");

            studentSection.innerHTML += 
            `
            <div class="select-student__name-section">
                <div class="select-student__icon-section">
                    <i class="select-student__icon fa-solid fa-user"></i>
                </div>
                <h3 class="select-student__info-name">${studentsList[i][0]}</h3>
            </div>
            <div class="select-student__info-section">
                <div class="select-student__info-body">
                    <h3 class="select-student__info-title">Student Info</h3>
                    <ul class="select-student__info-list">
                        <li class="select-student__list-item">Age: <span class="list-item__important-info">${studentsList[i][1]}</span></li>
                        <li class="select-student__list-item">Qualifications Amount: <span class="list-item__important-info">${studentsList[i][3].length}</span></li>
                        <li class="select-student__list-item">Qualifications: <span class="list-item__important-info">${studentsList[i][3].join(", ")}</span></li>
                        <li class="select-student__list-item">Key: <span class="list-item__important-info">${studentsList[i][2]}</span></li>
                    </ul>
                </div>
                <button class="select-student__button">Select Student</button>
            </div>
            `;

            fragment.appendChild(studentSection);
        }
        selectStudentStudentsSection.appendChild(fragment);

        const studentButtons = document.querySelectorAll(".select-student__button");
        studentButtons.forEach((button, i) => { // Con forEach el callback puede devolver tres argumentos: 1er parametro: el valor actual del elemento, 2do parametro: el índice del elemento y 3er parametro: el array que está siendo recorrido.
            button.addEventListener("click",()=>{
                hideModal(overlay, selectStudentSection);
                console.log(studentsList[i]);
                resolve(studentsList[i]); // Resuelve la promesa con el estudiante seleccionado
            })
        });

        document.querySelector(".select-student__close-button").addEventListener("click",()=>{
            hideModal(overlay, selectStudentSection);
            input.value = "";
        })

        showModal(overlay, selectStudentSection);
    });
}

const showModal = (over, mod) =>{
    over.classList.add("visible");
    mod.classList.add("visible");

    setTimeout(() => over.style.opacity = "1", 10);
    setTimeout(() => mod.style.opacity = "1", 10);
}

const hideModal = (over, mod) =>{
    over.style.opacity = "0";
    setTimeout(() => over.classList.remove("visible"), 700);

    mod.style.opacity = "0";
    setTimeout(() => mod.classList.remove("visible"), 700);
}


let studentToModifyName, studentToModifyAge, newQualificationsAmount, studentToModifyKey;
let modifyStudentIndex = 1;
let newQualifications = [];

modifyStudentSendButton.addEventListener("click", async()=>{
    if (modifyStudentInput.id === "modify-student-name") {
        let studentName = modifyStudentInput.value.trim();
        if (studentName !== "") studentName = configureStudentName(studentName);
        console.log(studentName);

        let studentData = await readObjects(MODE_COMPARE_VALUES, studentName);
        console.log(studentData);

        const verifyNoStudentsInList = studentData[0] == null && studentData[1] == 1 ? "No hay ningún estudiante añadido a la base de datos." : null;
        const verifyStudentNotFound = studentData[0] == null && studentData[1] == 2 ? "Ingrese un nombre válido: el nombre no coincide con el de ningún estudiante." : null;

        if (verifyInputValue(modifyStudentMessageSection, verifyNoStudentsInList, verifyStudentNotFound)) {
            let studentDataSelected;

            if (studentData.length > 1) studentDataSelected = await selectStudent(studentData, modifyStudentInput);
            else studentDataSelected = studentData[0];
            console.log(studentDataSelected);

            studentToModifyName = studentDataSelected[0];
            studentToModifyAge = studentDataSelected[1];
            studentToModifyKey = studentDataSelected[2];
            console.log(studentToModifyName, studentToModifyAge, studentToModifyKey);

            modifyFormElementsToQualificationsAmount(modifyStudentInput,"modify-student-qualifications-amount", modifyStudentSendButton);
        }
        else console.log("ERROR");
    }

    else if (modifyStudentInput.id == "modify-student-qualifications-amount") {
        if (validateStudentQualificationsAmount(modifyStudentInput, modifyStudentMessageSection)[0]) {
            console.log("CANTIDAD DE CALIFICACIONES ingresada correctamente.");
            newQualificationsAmount = validateStudentQualificationsAmount(modifyStudentInput, modifyStudentMessageSection)[1];
            console.log(newQualificationsAmount);
            modifyFormElementsToQualifications(modifyStudentInput, "modify-student-qualifications", modifyStudentIndex, modifyStudentSendButton);
        } 
        else console.log("Se ha ingresado una CANTIDAD DE CALIFICACIONES inválida.");
    }

    else if (modifyStudentInput.id == "modify-student-qualifications") {
        if (validateStudentQualOrAver(modifyStudentInput, modifyStudentMessageSection, QUALIFICATION)[0]) {
            console.log(`CALIFICACIÓN NROº${modifyStudentIndex} ingresada correctamente.`);
            let qualification = validateStudentQualOrAver(modifyStudentInput, modifyStudentMessageSection, QUALIFICATION)[1];
            newQualifications.push(qualification);
            console.log(newQualifications, modifyStudentIndex, newQualificationsAmount); // LUEGO SACAR ESTA LINEA
            modifyStudentIndex++;
            
            if (modifyStudentIndex <= newQualificationsAmount) {
                modifyFormElementsToQualifications(modifyStudentInput, "modify-student-qualifications", modifyStudentIndex, modifyStudentSendButton);
            } else {
                console.log(studentToModifyKey)
                modifyObject(addStudent(studentToModifyName, studentToModifyAge, newQualifications), studentToModifyKey);
                resetFormElementsToName(modifyStudentInput, "modify-student-name", modifyStudentSendButton);
                createSuccessMessage("Estudiante modificado éxitosamente.", modifyStudentMessageSection);
                modifyStudentIndex = 1;
                newQualifications.length = 0;
            }
        } 
        else console.log(`La CALIFICACIÓN NROº${modifyStudentIndex} es inválida.`);
    }
})


deleteStudentSendButton.addEventListener("click", async()=>{
    let studentName = deleteStudentInput.value.trim();
    if (studentName !== "") studentName = configureStudentName(studentName);
    console.log(studentName);

    let studentData = await readObjects(MODE_COMPARE_VALUES, studentName);

    const verifyNoStudentsInList = studentData[0] == null && studentData[1] == 1 ? "No hay ningún estudiante añadido a la base de datos." : null;
    const verifyStudentNotFound = studentData[0] == null && studentData[1] == 2 ? "Ingrese un nombre válido: el nombre no coincide con el de ningún estudiante." : null;

    if (verifyInputValue(deleteStudentMessageSection, verifyNoStudentsInList, verifyStudentNotFound)) {
        let studentDataSelected;

        if (studentData.length > 1) studentDataSelected = await selectStudent(studentData, deleteStudentInput);
        else studentDataSelected = studentData[0];
        console.log(studentDataSelected);

        deleteObject(studentDataSelected[2]); // studentDataSelected[2] es la key
        console.log(studentDataSelected[2]);

        createSuccessMessage(`Estudiante '${studentDataSelected[0]}' eliminado éxitosamente.`, deleteStudentMessageSection);
        deleteStudentInput.value = "";
    } 
    else console.log("ERROR");
})



const AGGREGATE_ORDER = "Aggregate Order";
const ALPHABETIC_ORDER = "Alphabetic Order";
const AVERAGE_BY_NAME = "Average By Name";
const AVERAGE_BY_RANGE = "Average By Range";

const listStudents = async (typeOfListing, inputValue, input) => {
    switch(typeOfListing) {
        case AGGREGATE_ORDER:
        case ALPHABETIC_ORDER:
            let studentsList = await readObjects(MODE_ADD_VALUES);

            let verifyNoStudentsInList = studentsList[0] == null && studentsList[1] == 1 ? "No hay ningún estudiante añadido a la base de datos." : null;

            if (verifyInputValue(listStudentsMessageSection, verifyNoStudentsInList)) {
                switch(typeOfListing) {
                    case AGGREGATE_ORDER:
                        console.log("Lista de estudiantes por orden de agregado:");
                        studentsSectionTitle.textContent = "Students list by Aggregate Order";
                        showStudents(studentsList);
                        break;
                    case ALPHABETIC_ORDER:
                        console.log("Lista de estudiantes por orden alfabético:");
                        studentsSectionTitle.textContent = "Students list by Alphabetic Order";
                        studentsList.sort();
                        showStudents(studentsList);
                }
            } else {
                closeSection(studentsSection, true);
                console.log("ERROR");
            }
            break;

        case AVERAGE_BY_NAME:
            let studentData = await readObjects(MODE_COMPARE_VALUES, inputValue);

            verifyNoStudentsInList = studentData[0] == null && studentData[1] == 1 ? "No hay ningún estudiante añadido a la base de datos." : null;
            const verifyStudentNotFound = studentData[0] == null && studentData[1] == 2 ? "Ingrese un nombre válido: el nombre no coincide con el de ningún estudiante." : null;

            if (verifyInputValue(studentAverageByNameMessageSection, verifyNoStudentsInList, verifyStudentNotFound)) {
                let studentDataSelected;

                input.value = "";

                if (studentData.length > 1) studentDataSelected = await selectStudent(studentData, input);
                else studentDataSelected = studentData[0];
                console.log(studentDataSelected);
                
                let qualifications = studentDataSelected[3];
                studentAverageByNameMessageSection.previousElementSibling.lastElementChild.value = "";
                console.log(`Promedio del Estudiante "${inputValue}":`);
                studentsSectionTitle.textContent = `Average of Student "${inputValue}"`;
                const qualificationsAverage = await readObjects(MODE_COMPARE_AND_ADD, qualifications);
                showStudents(qualificationsAverage);
            } else {
                closeSection(studentsSection, true);
                console.log("ERROR");
            }
            break;

        case AVERAGE_BY_RANGE:
            studentsList = await readObjects(MODE_COMPARE_AND_ADD, inputValue)

            verifyNoStudentsInList = studentsList[0] == null && studentsList[1] == 1 ? "No hay ningún estudiante añadido a la base de datos." : null;

            if (verifyInputValue(studentAverageByRangeMessageSection, verifyNoStudentsInList)) {
                console.log(`Lista de estudiantes con promedios mayores o iguales a ${inputValue}:`);
                studentsSectionTitle.textContent = `Students with an Average Higher or Same than ${inputValue}`;
                console.log(studentsList);
                showStudents(studentsList, true);
            } else {
                closeSection(studentsSection, true);
                console.log("ERROR");
            }
    }
    return { typeOfListing, inputValue, input };
}

const showStudents = (studentsList, caseAverByRange) =>{
    studentsSectionStudentContainer.replaceChildren();
    if (!studentsSection.classList.contains("visible")) studentsSection.classList.add("visible");
    const fragment = document.createDocumentFragment();

    if (studentsList.length == 0) {
        createStudent(true, "No matches found", fragment);
    } else {
        for (let i = 0; i < studentsList.length; i++) {
            console.log(studentsList[i]);
            if (Array.isArray(studentsList[i])) {
                if (caseAverByRange) createStudent(false, [studentsList[i][0], studentsList[i][1], studentsList[i][2]], fragment, true);
                else createStudent(false, [studentsList[i][0], studentsList[i][1]], fragment);
            } else createStudent(false, studentsList[i], fragment);
        }
    }
    studentsSectionStudentContainer.appendChild(fragment);
}

createStudent = (error, textContent, documentFragment, caseAverByRange)=>{
    let student, studentMainDataPoint, studentKey, studentInfoList, studentQualAver;
    if (caseAverByRange) {
        student = document.createElement("details");
        studentMainDataPoint = document.createElement("summary");
        studentInfoList = document.createElement("ul");
        studentKey = document.createElement("li");
        studentQualAver = document.createElement("li");
    } else {
        student = document.createElement("div");
        studentMainDataPoint = document.createElement("span");
        studentKey = document.createElement("span");
    }

    student.classList.add("student-container__student");
    if (error) student.classList.add("error");
    studentMainDataPoint.classList.add("student__main-data-point");

    if (Array.isArray(textContent)) {
        if (caseAverByRange) {
            studentInfoList.classList.add("student__info-list");
            studentKey.classList.add("student__info-point");
            studentQualAver.classList.add("student__info-point");

            studentKey.innerHTML = `Key: <span>${textContent[1]}</span>`;
            studentQualAver.innerHTML = `Qualifications Average: <span>${textContent[2]}</span>`;
        } else {
            studentKey.classList.add("student__key");
            studentKey.textContent = textContent[1];
        }

        studentMainDataPoint.textContent = textContent[0];
        student.appendChild(studentMainDataPoint);

        if (caseAverByRange) {
            student.appendChild(studentInfoList);
            studentInfoList.appendChild(studentKey);
            studentInfoList.appendChild(studentQualAver);
        } 
        else student.appendChild(studentKey);
    } else {
        studentMainDataPoint.textContent = textContent;
        student.appendChild(studentMainDataPoint);
    }
    documentFragment.appendChild(student);
}


document.getElementById("students-section__update-button").addEventListener("click", async ()=>{
    switch (lastTypeOfListing.typeOfListing) {
        case AGGREGATE_ORDER:
            listStudents(AGGREGATE_ORDER);
            break;
        case ALPHABETIC_ORDER:
            listStudents(ALPHABETIC_ORDER);
            break;
        case AVERAGE_BY_NAME:
            listStudents(AVERAGE_BY_NAME, lastTypeOfListing.inputValue, lastTypeOfListing.input);
            break;
        case AVERAGE_BY_RANGE:
            listStudents(AVERAGE_BY_RANGE, lastTypeOfListing.inputValue);
    }
})

document.getElementById("students-section__close-button").addEventListener("click",()=>{
    closeSection(studentsSection, true);
})

const closeSection = (section, conservePosTemp) =>{
    if (section.classList.contains("visible")) {
        if (conservePosTemp){
            section.style.position = "static";
            setTimeout(() => {
                section.style.position = "absolute";
                section.removeAttribute("style");
            }, 800);
        }
        section.classList.remove("visible");
    }
}

let lastTypeOfListing;

listStudentsAggrButton.addEventListener("click", async() => {
    // El error con el ID ocurria porque a los nombres con espacios entre medio se les aplicaba un ID más por cada espacio en blanco, por lo tanto, ese nombre terminaba teniendo varios IDs y no se comparaban bien.
    lastTypeOfListing = await listStudents(AGGREGATE_ORDER);
})

listStudentsAlphButton.addEventListener("click", async() => {
    lastTypeOfListing = await listStudents(ALPHABETIC_ORDER);
})



const toggleStudentAverageSectionElements = (studentAverageButton)=>{
    let isSectionClicked = studentAverageButton.classList.contains("active");

    if (isSectionClicked) removeStudentAverageSectionElements(studentAverageButton);
    else {
        const inputSection = studentAverageButton.closest(".inputs__input-section");
        const inputElements = studentAverageButton.closest(".main-section__input-elements");
        const labelSection = inputElements.querySelector(".input-elements__label-section");
        const input = studentAverageButton.closest(".input-elements__input");
        console.log(inputSection, inputElements, labelSection, input);

        studentAverageButton.classList.add("active","fa-solid", "fa-circle-xmark");
        studentAverageButton.textContent = "";

        const studentAverageSendButton = document.createElement("button");
        const studentAverageLabel = document.createElement("label");
        const studentAverageInput = document.createElement("input");

        inputSection.appendChild(studentAverageSendButton);
        if (studentAverageButton == studentAverageByNameButton) inputElements.insertBefore(studentAverageLabel, inputElements.firstElementChild);
        else labelSection.appendChild(studentAverageLabel);
        input.appendChild(studentAverageInput);

        studentAverageSendButton.classList.add("input-section__send-button");
        studentAverageLabel.classList.add("input-section__label");
        studentAverageInput.classList.add("input-section__input","other-configuration");

        if (studentAverageButton == studentAverageByNameButton) {
            studentAverageInput.id = "one-student-average-input";
            studentAverageInput.placeholder = "Nombre del Estudiante";
            studentAverageLabel.setAttribute("for","one-student-average-input");
            studentAverageLabel.textContent = "Search average by Name";
            studentAverageSendButton.textContent = "Search Name";
        } else if (studentAverageButton == studentAverageByRangeButton) {
            studentAverageInput.id = "range-student-average-input";
            studentAverageInput.placeholder = "Promedio";
            studentAverageLabel.setAttribute("for","range-student-average-input");
            studentAverageLabel.textContent = "Search average by Range";
            studentAverageSendButton.textContent = "Search Qualifications Average";

            const studentAverageInfo = document.createElement("i");
            studentAverageInfo.setAttribute("title","Se mostrarán los estudiantes con promedios mayores o iguales al ingresado")
            labelSection.appendChild(studentAverageInfo);
            studentAverageInfo.classList.add("input-section__info", "fa-solid", "fa-info");
        }

        createEnterInputEvent(studentAverageInput);
        
        switch(studentAverageButton){
            case studentAverageByNameButton:
                studentAverageSendButton.addEventListener("click",()=>{
                    let studentName = studentAverageInput.value.trim();
                    if (studentName !== "") studentName = configureStudentName(studentName);
                    console.log(studentName);

                    lastTypeOfListing = listStudents(AVERAGE_BY_NAME, studentName, studentAverageInput);
                })
                break;
            case studentAverageByRangeButton:
                studentAverageSendButton.addEventListener("click",()=>{
                    if (validateStudentQualOrAver(studentAverageInput, studentAverageByRangeMessageSection, QUALIFICATIONS_AVERAGE)[0]) {
                        console.log("PROMEDIO DE CALIFICACIONES ingresado correctamente.");
                        let qualificationsAverage = validateStudentQualOrAver(studentAverageInput, studentAverageByRangeMessageSection, QUALIFICATIONS_AVERAGE)[1];
                
                        lastTypeOfListing = listStudents(AVERAGE_BY_RANGE, qualificationsAverage);

                        studentAverageInput.value = "";
                    }
                    else console.log("Se ha ingresado un PROMEDIO DE CALIFICACIONES inválido.");
                })
        }
    }
}

const removeStudentAverageSectionElements = (studentAverageButton) =>{
    if (studentAverageButton.classList.contains("active")) {
        studentAverageButton.classList.remove("active","fa-solid","fa-circle-xmark");

        if (studentAverageButton == studentAverageByNameButton) studentAverageButton.textContent = "Search average by Name";
        else if (studentAverageButton == studentAverageByRangeButton) studentAverageButton.textContent = "Search average by Range";

        const inputSection = studentAverageButton.closest(".inputs__input-section");
        const inputMainSection = studentAverageButton.closest(".input-section__main-section");
        const inputElements = studentAverageButton.closest(".main-section__input-elements");
        const input = studentAverageButton.closest(".input-elements__input");

        const studentAverageSendButton = inputSection.querySelector(".input-section__send-button");
        const studentAverageMessageSection = inputMainSection.querySelector(".input-section__message-section");
        const studentAverageLabel = inputElements.querySelector(".input-section__label");
        const studentAverageInput = input.querySelector(".input-section__input");

        inputSection.removeChild(studentAverageSendButton);
        if (studentAverageButton == studentAverageByRangeButton) {
            const labelSection = inputElements.querySelector(".input-elements__label-section");
            labelSection.replaceChildren();
        } else {
            inputElements.removeChild(studentAverageLabel);
        }
        input.removeChild(studentAverageInput);

        studentAverageMessageSection.replaceChildren();
        studentAverageMessageSection.parentElement.style.gap = "0";
    }
}


studentAverageByNameButton.addEventListener("click",(e)=>{
    toggleStudentAverageSectionElements(e.target);
})

studentAverageByRangeButton.addEventListener("click",(e)=>{
    toggleStudentAverageSectionElements(e.target);
})




const addStudent = (name, age, qualifications) =>{
    return {name, age, qualifications};
}


const validateStudentName = ()=>{
    let studentName = addStudentInput.value.trim();
    return [verifyInputValue(addStudentMessageSection,
        verifyInputValueIsEmpty(studentName, NAME),
        verifyNameContainsNumber(studentName),
        verifyInputValueContainsSpecialSymbol(studentName, NAME)
    ), studentName];
}

const modifyFormElementsToAge = ()=>{
    addStudentInput.id = "add-student-age"
    // addStudentInput.type = "number";
    addStudentInput.placeholder = "Edad del Estudiante";
    addStudentInput.min = "5";
    addStudentInput.max = "100";
    addStudentInput.value = "";
    addStudentSendButton.textContent = "Send Age";
}


const validateStudentAge = ()=>{
    let studentAge = addStudentInput.value.replace(/\s+/g,"");
    return [verifyInputValue(addStudentMessageSection, 
        verifyInputValueIsEmpty(studentAge, AGE),
        verifyInputValueContainsLetter(studentAge, AGE),
        verifyInputValueContainsSpecialSymbol(studentAge, AGE),
        verifyInputValueIsHigherSameOrLowerSame(studentAge, 5, 100, AGE),
        verifyInputValueIsFloat(studentAge, AGE)
    ), parseInt(studentAge)];
};

const modifyFormElementsToQualificationsAmount = (input, id, sendButton) =>{
    input.id = id;
    input.placeholder = "Cantidad de Calificaciones del Estudiante";
    input.min = "1";
    input.max = "50";
    input.value = "";
    sendButton.textContent = "Send Qualifications Amount";
}


const validateStudentQualificationsAmount = (input, messageSection) =>{
    let studentQualificationsAmount = input.value.replace(/\s+/g,"");
    return [verifyInputValue(messageSection,
        verifyInputValueIsEmpty(studentQualificationsAmount, QUALIFICATIONS_AMOUNT),
        verifyInputValueContainsLetter(studentQualificationsAmount, QUALIFICATIONS_AMOUNT),
        verifyInputValueContainsSpecialSymbol(studentQualificationsAmount, QUALIFICATIONS_AMOUNT),
        verifyInputValueIsHigherSameOrLowerSame(studentQualificationsAmount, 1, 50, QUALIFICATIONS_AMOUNT),
        verifyInputValueIsFloat(studentQualificationsAmount, QUALIFICATIONS_AMOUNT)
    ), parseInt(studentQualificationsAmount)];
}

const modifyFormElementsToQualifications = (input, id, index, sendButton) =>{
    input.id = id;
    input.placeholder = `Calificación NROº${index} del Estudiante`;
    input.min = "1";
    input.max = "10";
    input.value = "";
    sendButton.textContent = "Send Qualification"
}


const validateStudentQualOrAver = (input, messageSection, propertyToCheck) =>{
    let studentQualOrProm = (input.value.replace(/\s+/g,"")).replace(",",".");
    return [verifyInputValue(messageSection,
        verifyInputValueIsEmpty(studentQualOrProm, propertyToCheck),
        verifyInputValueContainsLetter(studentQualOrProm, propertyToCheck),
        verifyInputValueContainsSpecialSymbol(studentQualOrProm, propertyToCheck),
        verifyInputValueIsHigherSameOrLowerSame(studentQualOrProm, 1, 10, propertyToCheck)
    ), parseFloat(studentQualOrProm)];
}

const resetFormElementsToName = (input, id, sendButton) =>{
    input.id = id; 
    input.type = "text"
    input.value = "";
    input.placeholder = "Nombre del Estudiante";
    switch (sendButton) {
        case addStudentSendButton:
            sendButton.textContent = "Send Name";
            break;
        case modifyStudentSendButton:
            sendButton.textContent = "Search Name";
    }
}


// CONFIGURACIÓN Y VERIFICACIONES

const verifyInputValue = (messageSection, ...validations)=>{
    messageSection.replaceChildren();
    messageSection.previousElementSibling.classList.remove("error");
    messageSection.parentElement.style.gap = "0";

    for (const validation of validations) {
        let errorMessage = validation;
        if (errorMessage !== null) {
            messageSection.previousElementSibling.classList.add("error");
            messageSection.appendChild(createMessage(errorMessage, messageSection, ERROR));
            console.log(errorMessage);
        }
    }
    
    // Cuando no se encuentra un elemento dentro de messageSection devuelve true, ya que cuando querySelector no encuentra ningún elemento devuelve null, si se encuentra un elemento devuelve false ya que es distinto de null. (CAMBIE ESO)
    return messageSection.children.length == 0;
}

const ERROR = "error";
const SUCCESS = "success";

const createMessage = (msg, messageSection, type) => {
    let message = document.createElement("li");
    message.classList.add("message-section__message");
    message.textContent = msg;

    messageSection.parentElement.style.gap = "5px";

    switch(type){
        case ERROR:
            message.classList.add("error-message");
            break;
        case SUCCESS:
            message.classList.add("success-message");
    }
    return message;
}


let id = 1;

const createSuccessMessage = (msg, messageSection) =>{
    messageSection.appendChild(createMessage(msg, messageSection, SUCCESS));
    console.log(msg);
    let successMessage = messageSection.querySelector(".success-message");
    successMessage.id = `successMessage${id}`;
    let successMessageId = successMessage.id;
    id++;
    setTimeout(() => {
        let messageToRemove = messageSection.querySelector(`#${successMessageId}`); // NO PUEDO USAR GETELEMENTBYID PORQUE ES UN MÉTODO DEL OBJETO DOCUMENT Y NO PUEDO USARLO CON MESSAGESECTION
        console.log(messageToRemove)
        if (messageToRemove) { 
            messageSection.removeChild(messageToRemove);
            messageSection.parentElement.style.gap = "0";
        }
    }, 4000);
}


const configureStudentName= studentName =>{
    let studentNameModified = studentName.toLowerCase();
    studentNameModified = studentNameModified.replace(/\s+/g," ");
    studentNameModified = studentNameModified.split(" ");
    studentNameModified = studentNameModified.map(name=>name[0].toUpperCase() + name.slice(1));
    studentNameModified = studentNameModified.join(" ");
    return studentNameModified;
}


// VERIFICACIONES

const NAME = "nombre";
const AGE = "edad";
const QUALIFICATION = "calificación";
const QUALIFICATIONS_AMOUNT = "cantidad de calificaciones";
const QUALIFICATIONS_AVERAGE = "promedio de calificaciones";

const verifyInputValueIsEmpty = (inputValue,propertyToCheck) => {
    switch(propertyToCheck) {
        case NAME:
        case QUALIFICATIONS_AVERAGE:
            // Si la condición se cumple se retorna lo que esta dentro de ? si no se cumple se retorna lo que este dentro de :
            return inputValue === "" ? `Ingrese un ${propertyToCheck} válido: ${propertyToCheck} vacío.` : null;
        case AGE: 
        case QUALIFICATION: 
        case QUALIFICATIONS_AMOUNT:
            return inputValue === "" ? `Ingrese una ${propertyToCheck} válida: ${propertyToCheck} vacía.` : null;
    }
};

const verifyNameContainsNumber = studentName => {
    return /\d/.test(studentName) ? "Ingrese un nombre válido: el nombre contiene un número." : null;
};

const verifyInputValueContainsLetter = (inputValue,propertyToCheck) => {
    switch(propertyToCheck) {
        case QUALIFICATIONS_AVERAGE:
            return /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(inputValue) ? `Ingrese un ${propertyToCheck} válido: el ${propertyToCheck} contiene una letra.` : null;
        case AGE:
        case QUALIFICATION:
        case QUALIFICATIONS_AMOUNT:
            return /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(inputValue) ? `Ingrese una ${propertyToCheck} válida: la ${propertyToCheck} contiene una letra.` : null;
    }
}

const verifyInputValueContainsSpecialSymbol = (inputValue,propertyToCheck) => {
    switch(propertyToCheck) {
        case NAME:
            return /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]/g.test(inputValue) ? `Ingrese un ${propertyToCheck} válido: el ${propertyToCheck} contiene un símbolo especial.` : null;
        case QUALIFICATIONS_AVERAGE:
            inputValue = inputValue.replace(",",".");

            return /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]/g.test(inputValue) && !(/^\d+\.\d+$/.test(inputValue)) ? `Ingrese un ${propertyToCheck} válido: el ${propertyToCheck} contiene un símbolo especial.` : null;
        case AGE: 
        case QUALIFICATION: 
        case QUALIFICATIONS_AMOUNT:
            inputValue = inputValue.replace(",",".");

            return /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]/g.test(inputValue) && !(/^\d+\.\d+$/.test(inputValue)) ? `Ingrese una ${propertyToCheck} válida: la ${propertyToCheck} contiene un símbolo especial.` : null;
    }
}

const verifyInputValueIsHigherSameOrLowerSame = (inputValue,higherThan,lowerThan,propertyToCheck) => {
    let inputValueEmpty = false;

    if (inputValue == "") inputValueEmpty = true;
    let isInvalid = /^\.\d+$/.test(inputValue) || /^\d+\.$/.test(inputValue);

    if (!inputValueEmpty && !isInvalid){
        switch (propertyToCheck) {
            case QUALIFICATIONS_AVERAGE:
                return inputValue < higherThan || inputValue > lowerThan ? `Ingrese un ${propertyToCheck} válido: el ${propertyToCheck} debe estar entre ${higherThan} y ${lowerThan}.` : null;
            case AGE: 
            case QUALIFICATION: 
            case QUALIFICATIONS_AMOUNT:
                return inputValue < higherThan || inputValue > lowerThan ? `Ingrese una ${propertyToCheck} válida: la ${propertyToCheck} debe estar entre ${higherThan} y ${lowerThan}.` : null;
        }
    } 
    else return null;
}

const verifyInputValueIsFloat = (inputValue, propertyToCheck) => {
    inputValue = inputValue.replace(",",".");

    return /^\d+\.\d+$/.test(inputValue) ? `Ingrese una ${propertyToCheck} válida: la ${propertyToCheck} debe ser un número entero.` : null;
}