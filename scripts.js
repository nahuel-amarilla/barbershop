// scripts.js - Lógica de Reserva NCS Safety

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn-outline-gold, .card-service .btn-gold');
    const bookingContainer = document.getElementById('booking-container');

    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Buscamos el nombre del servicio en la tarjeta
            const serviceName = e.target.parentElement.querySelector('h3').innerText;
            const price = e.target.parentElement.querySelector('.price').innerText;

            // Cambiamos el contenedor de reserva por el calendario
            renderCalendar(serviceName, price);
        });
    });
});

function renderCalendar(service, price) {
    const container = document.getElementById('booking-container');
    
    // Estos horarios son de prueba, después los traeremos de la base de datos
    const availableHours = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"];

    container.innerHTML = `
        <div class="animate-fade-in">
            <h4 class="mb-3">Booking: <span class="gold-text">${service}</span> (${price})</h4>
            <p>Select an available time for today:</p>
            <div class="d-flex flex-wrap justify-content-center gap-2 mb-4">
                ${availableHours.map(hour => `
                    <button class="btn btn-outline-gold time-slot">${hour}</button>
                `).join('')}
            </div>
            <div id="confirmation-form" class="d-none mt-4">
                <input type="text" id="client-name" class="form-control mb-2 bg-dark text-white border-gold" placeholder="Your Full Name">
                <button class="btn btn-gold w-100" onclick="confirmBooking()">CONFIRM RESERVATION</button>
            </div>
        </div>
    `;

    // Lógica para seleccionar la hora
    const slots = document.querySelectorAll('.time-slot');
    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            slots.forEach(s => s.classList.remove('active-slot'));
            slot.classList.add('active-slot');
            document.getElementById('confirmation-form').classList.remove('d-none');
        });
    });
}

async function confirmBooking() {
    const name = document.getElementById('client-name').value;
    if (!name) return alert("Please enter your name");

    const { data, error } = await supabaseClient
        .from('appointments') 
        .insert([{ 
            client_name: name, 
            service_name: selectedService, 
            appointment_time: selectedTime 
        }]);

    if (error) {
        console.error(error);
        alert("Error: " + error.message);
    } else {
        // Mensaje en inglés para el cliente
        alert("Success! Your appointment has been booked, " + name + ". See you soon!");
        location.reload(); 
    }
}
// Tus datos reales de la captura
const SUPABASE_URL = 'https://vldxrgqfhyiovmhpwwji.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_-7QXKM09mwe4tkJrmeGj2Q_5SEckfef';

// Creamos el cliente de conexión
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);