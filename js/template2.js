const templatedHtml = `
<div id="userName class="header text-center">
    <p class="fs-2 mb-0"></p>
</div>

<div id="userInfo">
    <p class="fw-light ms-auto text-center"></p>
</div>

<div class="education">
    <p class="fs-4 text-center">Education</p>
    <hr>
</div>

<div class="experience">
    <p class="fs-4 text-center">Professional Experience</p>
    <hr>
</div>

<div class="tech-skills container">
    <p class="fs-4 text-center">Technical Skills</p>
    <hr>
</div>

<div class="certifications">
    <p class="fs-4 text-center">Certfications</p>
    <hr>
</div>
`

function createUserNameHeader(name) {
    // <div class="header text-center">
    //     <p class="fs-2 mb-0">Dale Earnhardt</p>
    // </div>
    let userNameDiv = document.getElementById("userName");
    let userName = createElement("p", name, ["fs-2", "mb-0"])
    userNameDiv.append(userName);

    document.title = name + " Resume";
}

function createContactInfo(contactInfo) {
    // <div id="userInfo">
    //     <p class="fw-light ms-auto text-center">Kannapolis, NC | (123)-555-1234 | dale.e@gmail.com | linkedin.com/in/daleE | github.com/daleE</p>
    // </div>
    let contactInfoDiv = document.getElementById("userInfo");
    let contactInfo = createElement("p", contactInfo.join(" | "), ["fw-light", "ms-auto", "text-center"]);
    contactInfoDiv.append(contactInfo);
}

function createEducationSection(education) {
    // <div class="education">
    //     <p class="fs-4 text-center">Education</p>
    //     <hr>

    //     <div class="hstack">
    //         <p class="fw-bold mb-0">University of Dayton</p>
    //         <p class="mb-0 ms-auto">GPA 3.6</p>
    //     </div>

    //     <div class="hstack gap-2 p-0 m-0">
    //         <p class="mb-0">Bachelors, Management Information Systems</p>
    //         <p class="ms-auto mb-0">December 2020</p>
    //     </div>

    //     <ul>
    //         <li>Class Marshall Award</li>
    //         <li>Dean's List Academic Achievement Award</li>
    //         <li>Data Science Project: Financial Market Analysis Using Machine Learning</li>
    //         <li>Capstone Project: Employee Managemet System</li>
    //     </ul>

    //     <p class="fw-bold mb-0">University of Malaya</p>
    //     <div class="hstack">
    //         <p>Bachelor of Computer Science</p>
    //         <p class="ms-auto">June 2009</p>
    //     </div>
    // </div>
    let educationDiv = document.getElementById("education");
    educationDiv.classList.remove(visuallyHidden);

    education.forEach(e => {
        let stack = createDiv("", ["hstack"]);
        let educationName = createElement("p", e.trainingName, ["fw-bold", "mb-0"]);
        stack.append(educationName);

        let title = createDiv(e.trainingName, ["fw-bold"]);
        stack.appendChild(title);

        let institution = createDiv(e.institutionName, ["text-muted", "fw-lighter"]);
        stack.appendChild(institution);

        let graduation = createDiv(e.graduationDate, ["text-muted", "ms-auto", "fw-light"]);
        stack.appendChild(graduation);

        let degree = createDiv(e.degreeName, ["fst-italic"]);

        educationDiv.appendChild(stack);
        educationDiv.appendChild(degree);
    });
}

function createSkillsSection(skills) {
    // <div class="tech-skills container">
    //     <p class="fs-4 text-center">Technical Skills</p>
    //     <hr>

    //     <div class="row">
    //         <div class="col">
    //             <p class="ms-auto text-start">Machine Learning</p>
    //             <p class="ms-auto">Python/Scikit-Learn</p>
    //             <p class="ms-auto">Spark</p>
    //             <p class="ms-auto">Data Visualization</p>

    //         </div>

    //         <div class="col">
    //             <p class="ms-auto">Quantitative Analysis</p>
    //             <p class="ms-auto">Cloud Computing</p>
    //             <p class="ms-auto">Hadoop</p>
    //             <p class="ms-auto">Java/C#</p>

    //         </div>

    //         <div class="col">
    //             <p class="ms-auto">Unix Scripting</p>
    //             <p class="ms-auto">Oracle/SQL Server</p>
    //             <p class="ms-auto">PLSQL/T-SQL</p>
    //             <p class="ms-auto">Data Warehousing/ETL</p>
    //         </div>

    //         <div class="col">
    //             <p class="ms-auto">RDBMS Tuning</p>
    //             <p class="ms-auto">Network Protocols</p>
    //             <p class="ms-auto">Agile & DevOps</p>
    //             <p class="ms-auto">Web Development</p>
    //         </div>
    //     </div>
    // </div>

    // <div class="certifications">
    //     <p class="fs-4 text-center">Certfications</p>
    //     <hr>

    //     <div class="hstack">
    //         <p class="mb-0">4-course graduate-level certificate in Data Science, Harvard University</p>
    //         <p class="ms-auto mb-0">January 2018</p>
    //     </div>

    //     <div class="hstack">
    //         <p class="mb-0">ITIL Foundation V3</p>
    //         <p class="ms-auto mb-0">January 2018</p>
    //     </div>

    //     <div class="hstack">
    //         <p class="mb-0">Project Management Professional (PMP)</p>
    //         <p class="ms-auto mb-0">January 2018</p>
    //     </div>

    //     <div class="hstack">
    //         <p class="mb-0">Certified Salesforce Developer</p>
    //         <p class="ms-auto mb-0">January 2018</p>
    //     </div>
    // </div>
    let skillsDiv = document.getElementById("skills");
    skillsDiv.classList.remove(visuallyHidden);

    skills.forEach(e => {
        let wrappingDiv = createDiv("", []);

        let catName = document.createElement("strong");
        catName.textContent = e.categoryName + ": ";

        wrappingDiv.appendChild(catName);
        wrappingDiv.append(e.categoryValues.join(", "));

        skillsDiv.appendChild(wrappingDiv);
    });
}

function createWorkExperienceSection(experience) {
    // <div class="experience">
    //     <p class="fs-4 text-center">Professional Experience</p>
    //     <hr>

    //     <div class="hstack">
    //         <p class="fw-bold mb-0">Rande Corporate & Investment Banking</p>
    //         <p class="ms-auto mb-0">Detriot, MI</p>
    //     </div>

    //     <div class="hstack">
    //         <p class="mb-0">Associate - Information Technology</p>
    //         <p class="ms-auto mb-0">Sept. 2013 - Present</p>
    //     </div>

    //     <ul>
    //         <li>Lead a team of 6 people to manage, operate, and support low latency post-trade brokerage
    //             platform</li>
    //         <li>Improved the performance od straight-through processing by tuning database applications</li>
    //         <li>Reduced number of major incidents by 23% through problem management</li>
    //         <li>Automate manual back office processing through scripting and automation engine</li>
    //         <li>Actively participate and contribute to the internal data science project initiatives</li>
    //     </ul>

    //     <div class="hstack">
    //         <p class="fw-bold mb-0">Rande Corporate & Investment Banking</p>
    //         <p class="ms-auto mb-0">Detriot, MI</p>
    //     </div>

    //     <div class="hstack">
    //         <p class="mb-0">Associate - Information Technology</p>
    //         <p class="ms-auto mb-0">Sept. 2013 - Present</p>
    //     </div>

    //     <ul>
    //         <li>Lead a team of 6 people to manage, operate, and support low latency post-trade brokerage
    //             platform</li>
    //         <li>Improved the performance od straight-through processing by tuning database applications</li>
    //         <li>Reduced number of major incidents by 23% through problem management</li>
    //         <li>Automate manual back office processing through scripting and automation engine</li>
    //         <li>Actively participate and contribute to the internal data science project initiatives</li>
    //     </ul>

    //     <div class="hstack">
    //         <p class="fw-bold mb-0">Rande Corporate & Investment Banking</p>
    //         <p class="ms-auto mb-0">Detriot, MI</p>
    //     </div>

    //     <div class="hstack">
    //         <p class="mb-0">Associate - Information Technology</p>
    //         <p class="ms-auto mb-0">Sept. 2013 - Present</p>
    //     </div>

    //     <ul>
    //         <li>Lead a team of 6 people to manage, operate, and support low latency post-trade brokerage
    //             platform</li>
    //         <li>Improved the performance od straight-through processing by tuning database applications</li>
    //         <li>Reduced number of major incidents by 23% through problem management</li>
    //         <li>Automate manual back office processing through scripting and automation engine</li>
    //         <li>Actively participate and contribute to the internal data science project initiatives</li>
    //     </ul>

    //     <div class="hstack">
    //         <p class="fw-bold mb-0">Rande Corporate & Investment Banking</p>
    //         <p class="ms-auto mb-0">Detriot, MI</p>
    //     </div>

    //     <div class="hstack">
    //         <p class="mb-0">Associate - Information Technology</p>
    //         <p class="ms-auto mb-0">Sept. 2013 - Present</p>
    //     </div>

    //     <ul>
    //         <li>Lead a team of 6 people to manage, operate, and support low latency post-trade brokerage
    //             platform</li>
    //         <li>Improved the performance od straight-through processing by tuning database applications</li>
    //         <li>Reduced number of major incidents by 23% through problem management</li>
    //         <li>Automate manual back office processing through scripting and automation engine</li>
    //         <li>Actively participate and contribute to the internal data science project initiatives</li>
    //     </ul>

    //     <div class="hstack">
    //         <p class="fw-bold mb-0">Rande Corporate & Investment Banking</p>
    //         <p class="ms-auto mb-0">Detriot, MI</p>
    //     </div>

    //     <div class="hstack">
    //         <p class="mb-0">Associate - Information Technology</p>
    //         <p class="ms-auto mb-0">Sept. 2013 - Present</p>
    //     </div>

    //     <ul>
    //         <li>Lead a team of 6 people to manage, operate, and support low latency post-trade brokerage
    //             platform</li>
    //         <li>Improved the performance od straight-through processing by tuning database applications</li>
    //         <li>Reduced number of major incidents by 23% through problem management</li>
    //         <li>Automate manual back office processing through scripting and automation engine</li>
    //         <li>Actively participate and contribute to the internal data science project initiatives</li>
    //     </ul>
    // </div>
    let experienceDiv = document.getElementById("experience");
    experienceDiv.classList.remove(visuallyHidden);

    experience.forEach(e => {
        let wrappingDiv = document.createElement("div");

        let headerDiv = createHStack();

        let title = createDiv(e.company, ["fw-bold"]);
        headerDiv.appendChild(title);

        if (e.subCompany) {
            title = createDiv(e.subCompany, ["text-muted", "fw-lighter"]);
            headerDiv.appendChild(title);
        }

        title = document.createElement("div");
        title = createDiv(e.location, ["text-muted", "ms-auto", "fw-light"]);
        headerDiv.appendChild(title);

        wrappingDiv.appendChild(headerDiv);

        let titleDiv = createHStack();

        title = createDiv(e.jobTitle, ["fst-italic"]);
        titleDiv.appendChild(title);

        title = createDiv(e.timeframe.start + " - " + e.timeframe.end, ["text-muted", "ms-auto", "fw-light"]);
        titleDiv.appendChild(title);

        wrappingDiv.appendChild(titleDiv);

        let experienceList = document.createElement("ul");
        experienceList.classList.add("fs-7", "p-3", "pt-0", "m-0", "ms-1");

        e.experience.forEach(ex => {
            let exp = document.createElement("li");
            exp.textContent = ex;
            experienceList.appendChild(exp);
        });

        wrappingDiv.appendChild(experienceList);
        experienceDiv.appendChild(wrappingDiv);
    });
}

function createProjectsSection(projects) {
    let projectsDiv = document.getElementById("projects");
    projectsDiv.classList.remove(visuallyHidden);

    projects.forEach(e => {
        let wrappingDiv = createDiv("", []);
        let hstack = createHStack();
        let name = createDiv(e.name, ["fw-bold"]);
        let timeframe = createTimeFrameDiv(e.timeframe);
        let description = createDiv(e.description, []);

        hstack.appendChild(name);
        hstack.appendChild(timeframe);
        wrappingDiv.appendChild(hstack);
        wrappingDiv.appendChild(description);
        projectsDiv.appendChild(wrappingDiv);
    });
}