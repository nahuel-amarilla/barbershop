const SUPABASE_URL = 'https://vldxrgqfhyiovmhpwwji.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_-7QXKM09mwe4tkJrmeGj2Q_5SEckfef';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let selectedService = "";
let selectedTime = "";

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn-outline-gold, .card-service .btn-gold');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.card-service');
            selectedService = card.querySelector('h3').innerText;
            const price = card.querySelector('.price').innerText;
            document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
            
            // Ahora primero chequeamos disponibilidad antes de renderizar
            checkAvailabilityAndRender(selectedService, price);
        });
    });
});

async function checkAvailabilityAndRender(service, price) {
    const container = document.getElementById('booking-container');
    container.innerHTML = `<p class="text-white">Checking availability...</p>`;

    // --- LÓGICA NIVEL PRO: SOLO TURNOS DE HOY ---
    const today = new Date().toISOString().split('T')[0]; // Ejemplo: "2026-03-23"

    const { data: bookedAppointments, error } = await supabaseClient
        .from('appointments')
        .select('appointment_time')
        .gte('created_at', `${today}T00:00:00Z`) // Desde que empezó hoy
        .lte('created_at', `${today}T23:59:59Z`); // Hasta que termine hoy

    if (error) {
        console.error(error);
        return alert("Error checking availability");
    }
    // --------------------------------------------

    const allHours = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"];
    const takenHours = bookedAppointments.map(a => a.appointment_time);
    const availableHours = allHours.filter(hour => !takenHours.includes(hour));

    renderCalendar(service, price, availableHours);
}

    // Lista de todos los horarios posibles
    const allHours = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"];
    
    // Filtramos: solo dejamos los que NO están en los datos traídos de Supabase
    const takenHours = bookedAppointments.map(a => a.appointment_time);
    const availableHours = allHours.filter(hour => !takenHours.includes(hour));

    renderCalendar(service, price, availableHours);
}

function renderCalendar(service, price, availableHours) {
    const container = document.getElementById('booking-container');

    if (availableHours.length === 0) {
        container.innerHTML = `<h4 class="text-danger">Sorry, no slots available for today!</h4>`;
        return;
    }

    container.innerHTML = `
        <div class="animate-fade-in">
            <h4 class="mb-3 text-white">Booking: <span class="gold-text">${service}</span></h4>
            <div class="d-flex flex-wrap justify-content-center gap-2 mb-4">
                ${availableHours.map(hour => `<button class="btn btn-outline-gold time-slot">${hour}</button>`).join('')}
            </div>
            <div id="confirmation-form" class="d-none mt-4">
                <input type="text" id="client-name" class="form-control mb-2 bg-dark text-white border-gold text-center" placeholder="Enter Your Full Name" style="max-width: 300px; margin: 0 auto;">
                <button id="final-confirm" class="btn btn-gold w-100" style="max-width: 300px;">CONFIRM RESERVATION</button>
            </div>
        </div>
    `;

    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            selectedTime = slot.innerText;
            document.getElementById('confirmation-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active-slot'));
            slot.classList.add('active-slot');
            document.getElementById('confirmation-form').classList.remove('d-none');
        });
    });

    document.getElementById('final-confirm').addEventListener('click', confirmBooking);
}

async function confirmBooking() {
    const name = document.getElementById('client-name').value.trim();
    if (!name) return alert("Please enter your name");

    const btn = document.getElementById('final-confirm');
    const container = document.getElementById('booking-container');
    btn.innerText = "Processing...";
    btn.disabled = true;

    const { error } = await supabaseClient
        .from('appointments') 
        .insert([{ client_name: name, service_name: selectedService, appointment_time: selectedTime }]);

    if (error) {
        alert("Error: " + error.message);
        btn.disabled = false;
    } else {
        container.style.opacity = "0";
        setTimeout(() => {
            container.innerHTML = `
                <div class="animate-fade-in text-center py-5">
                    <span style="font-size: 60px;">✅</span>
                    <h2 class="gold-text">Confirmed!</h2>
                    <p class="text-white">See you at <strong>${selectedTime}</strong>, ${name}.</p>
                    <button class="btn btn-outline-gold mt-3" onclick="location.reload()">Done</button>
                </div>
            `;
            container.style.opacity = "1";
        }, 500);
    }
}