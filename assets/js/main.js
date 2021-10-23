//import html2pdf from "html2pdf.bundle.min.js"

/*==================== SHOW MENU ====================*/
const showMenu = (toggleId, navId) => {
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId)

    if(toggle && nav) {
        toggle.addEventListener('click', ()=>{
            nav.classList.toggle('show-menu')
        })
    }
}
showMenu('nav-toggle', 'nav-menu')

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction() {
    const navMenu = document.getElementById('nav-menu')
    navMenu.classList.remove('show-menu')
}

navLink.forEach(n => n.addEventListener('click', linkAction))

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

function scrollActive() {
    const scrollY = window.pageYOffset

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight
        const sectiontop = current.offsetTop - 50;
        const sectionId = current.getAttribute('id')

        if(scrollY > sectiontop && scrollY <= sectiontop + sectionHeight) {
            document.querySelectorAll('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link')
        } else {
            document.querySelectorAll('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link')
        }
    })
}
window.addEventListener('scroll', scrollActive)

/*==================== SHOW SCROLL TOP ====================*/ 
function scrollTop() {
    const scrollTop = document.getElementById('scroll-top');
    if(this.scrollY >= 560) {
        scrollTop.classList.add('show-scroll')
    } else {
        scrollTop.classList.remove('show-scroll')
    }
}
window.addEventListener('scroll', scrollTop)

/*==================== DARK LIGHT THEME ====================*/ 
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'bx-sun'

const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'bx-moon' : 'bx-sun'

if(selectedTheme) {
    document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
    themeButton.classList[selectedTheme === 'bx-moon' ? 'add' : 'remove'](iconTheme)
}

themeButton.addEventListener('click', () => {
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})
/*==================== REDUCE THE SIZE AND PRINT ON AN A4 SHEET ====================*/ 
function scaleCV() {
    document.body.classList.add('scale-cv')
}

/*==================== REMOVE THE SIZE WHEN THE CV IS DOWNLOADED ====================*/ 
function removeScale() {
    document.body.classList.remove('scale-cv')
}

/*==================== GENERATE PDF ====================*/ 
// PDF generated area
let areaCv = document.getElementById('area-cv')
let resumeButton = document.getElementById('resume-button')

// Html2pdf options
let opt = {
    margin: 1,
    filename: 'Resume.pdf',
    image: {type: 'png', quality: 0.98 },
    html2canvas: { scale: 4},
    jsPDF: {format: 'a4', orientation: 'portrait'}
}

// Function to call areaCv and Html2Pdf options 
function generateResume() {
    var worker = html2pdf();
    var worker = html2pdf().set(opt).from(areaCv).save();
    //html2pdf().set(opt).from(areaCv).toPdf().save()
}

// When the button is clicked, it executes the three functions
resumeButton.addEventListener('click', () => {
    scaleCV()
    generateResume()
    setTimeout(removeScale, 5000)
})
    // 1. The class .scale-cv is added to the body, where it reduces the size of the elements


    // 2. The PDF is generated


    // 3. The .scale-cv class is removed from the body after 5 seconds to return to normal size.