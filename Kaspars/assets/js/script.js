const toggleThemeBtn = document.getElementById('theme-tooggleID');

toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('darkmode');
    
    // Update button text based on current theme
    if (document.body.classList.contains('darkmode')) {
        toggleThemeBtn.textContent = '☀️ Gaišā';
    } else {
        toggleThemeBtn.textContent = '🌓 Tumšā';
    }
});

// Initialize button text
if (document.body.classList.contains('darkmode')) {
    toggleThemeBtn.textContent = '☀️ Gaišā';
} else {
    toggleThemeBtn.textContent = '🌓 Tumšā';
}

/* --- 1. Hamburgera izvēlnes funkcionalitāte --- */
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});

// Aizvērt izvēlni, kad noklikšķina uz saites
document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));


/* --- 2. Meklēšanas filtrs --- */
const searchInput = document.getElementById('searchInput');
// Pārbaudam vai elements eksistē, lai nebūtu kļūdu ja nav HTML
if(searchInput) {
    searchInput.addEventListener('keyup', function(e) {
        const term = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.card');

        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const desc = card.querySelector('.card-description').textContent.toLowerCase();
            
            // Meklē gan virsrakstā, gan aprakstā
            if(title.includes(term) || desc.includes(term)) {
                card.style.display = 'flex'; // Tavā CSS card ir flex
                // Pievienojam animāciju atrastajiem
                card.style.animation = 'fadeInRight 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    });
}


/* --- 3. Formas validācija --- */
const contactForm = document.getElementById('contactForm');

if(contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Neļauj pārlādēt lapu
        
        let isValid = true;
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');
        const successMsg = document.getElementById('successMessage');

        // Notīrīt iepriekšējās kļūdas
        document.querySelectorAll('.error-msg').forEach(el => el.innerText = '');
        document.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));
        successMsg.style.display = 'none';

        // Vārda pārbaude
        if(name.value.trim() === '') {
            showError(name, 'Vārds ir obligāts');
            isValid = false;
        }

        // E-pasta pārbaude
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email.value.trim())) {
            showError(email, 'Ievadiet derīgu e-pastu');
            isValid = false;
        }

        // Ziņojuma pārbaude
        if(message.value.trim() === '') {
            showError(message, 'Ziņojums nevar būt tukšs');
            isValid = false;
        }

        if(isValid) {
            // Veiksmīga darbība
            successMsg.style.display = 'block';
            contactForm.reset();
            // Pēc 3 sekundēm paslēpt paziņojumu
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        }
    });
}

function showError(input, message) {
    const formGroup = input.parentElement;
    const errorDisplay = formGroup.querySelector('.error-msg');
    errorDisplay.innerText = message;
    errorDisplay.style.display = 'block';
    formGroup.classList.add('error');
    
    // Vizuāls efekts (kratīšanās)
    formGroup.style.animation = 'shake 0.3s ease';
    setTimeout(() => {
        formGroup.style.animation = 'none';
    }, 3000);
}

/* --- 4. Modālais logs --- */
const modal = document.getElementById("infoModal");
const closeModalSpan = document.querySelector(".close-modal");
const closeBtn = document.getElementById("closeBtn");
const cardButtons = document.querySelectorAll(".card-button");

// Funkcija, lai atvērtu modālo logu ar saturu
cardButtons.forEach(btn => {
    // Pārbaudām, vai tā ir kartītes poga (nevis formas vai header poga)
    if(btn.closest('.card')) {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest(".card");
            const title = card.querySelector(".card-title").innerText;
            const desc = card.querySelector(".card-description").innerText;
            const imgSrc = card.querySelector(".card-image").src;
            const price = card.querySelector(".card-price").innerText;

            // Ievietojam datus modālajā logā
            document.getElementById("modalTitle").innerText = title;
            document.getElementById("modalDescription").innerHTML = `${desc}<br><br><strong>Cena: ${price}</strong><br>Plašāka specifikācija un līzinga iespējas pieejamas klātienē.`;
            document.getElementById("modalImage").src = imgSrc;

            modal.style.display = "block";
        });
    }
});

// Aizvēršanas funkcijas
if(closeModalSpan) {
    closeModalSpan.onclick = () => modal.style.display = "none";
}
if(closeBtn) {
    closeBtn.onclick = () => modal.style.display = "none";
}
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};


/* --- 5. Weather (Laikapstākļu) API Funkcionalitāte --- */
const weatherBtn = document.getElementById('loadWeatherBtn');
const weatherInput = document.getElementById('cityInput');
const weatherContainer = document.getElementById('weatherContainer');

if (weatherBtn) {
    weatherBtn.addEventListener('click', () => {
        const city = weatherInput.value.trim();
        if (city) {
            getWeather(city);
        } else {
            alert('Lūdzu, ievadi pilsētas nosaukumu!');
        }
    });

    // Ļauj nospiest "Enter" taustiņu, lai meklētu
    weatherInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const city = weatherInput.value.trim();
            if (city) getWeather(city);
        }
    });
}

async function getWeather(city) {
    // Parāda ielādes tekstu
    weatherContainer.innerHTML = '<p style="color: var(--card-text);">Meklē datus...</p>';

    try {
        // 1. SOLIS: Dabūjam koordinātas (Geocoding API)
        // Mēs izmantojam count=1, lai dabūtu tikai populārāko rezultātu
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=lv&format=json`);
        const geoData = await geoResponse.json();

        // Pārbauda, vai pilsēta eksistē
        if (!geoData.results) {
            throw new Error('Pilsēta nav atrasta. Mēģiniet ievadīt angliski vai pārbaudiet pareizrakstību.');
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // 2. SOLIS: Dabūjam laikapstākļus pēc koordinātēm
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherResponse.json();
        
        const current = weatherData.current_weather;

        weatherContainer.innerHTML = `
            <div class="card" style="animation: fadeIn 0.5s ease; max-width: 400px; margin: 0;">
                <img src="https://source.unsplash.com/400x200/?${name},city" alt="${name}" class="card-image">
                <div class="card-content">
                    <h3 class="card-title">${name}, ${country}</h3>
                    <div class="card-price">${current.temperature}°C</div>
                    <p class="card-description">
                        <strong>Vējš:</strong> ${current.windspeed} km/h<br>
                        <strong>Vēja virziens:</strong> ${current.winddirection}°<br>
                        <strong>Kods:</strong> WMO ${current.weathercode}
                    </p>
                </div>
            </div>
        `;

    } catch (error) {
        weatherContainer.innerHTML = `<div style="color: #e74c3c; background: rgba(255,0,0,0.1); padding: 10px; border-radius: 5px;">Kļūda: ${error.message}</div>`;
    }
}