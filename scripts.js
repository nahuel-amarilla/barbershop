// 1. Configuración de Supabase (Tus credenciales reales)
const SUPABASE_URL = 'https://vldxrgqfhyiovmhpwwji.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_-7QXKM09mwe4tkJrmeGj2Q_5SEckfef';

// 2. Inicializamos el cliente
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let selectedService = "";
let selectedTime = "";

document.addEventListener('DOMContentLoaded', () => {
    // Escuchamos clics en los botones de "Select" de los servicios
    const buttons = document.querySelectorAll('.btn-outline-gold, .card-service .btn-gold');
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.card-service');
            selectedService = card.querySelector('h3').innerText;
            const price = card.querySelector('.price').innerText;
            
            // Bajamos al calendario y lo dibujamos
            document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
            renderCalendar(selectedService, price);
        });
    });
});

// 3. Función para dibujar el calendario de horas
function renderCalendar(service, price) {
    const container = document.getElementById('booking-container');
    const availableHours = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"];

    container.innerHTML = `
        <div class="animate-fade-in">
            <h4 class="mb-3 text-white">Booking: <span class="gold-text">${service}</span> (${price})</h4>
            <p class="text-muted">Select an available time for today:</p>
            <div class="d-flex flex-wrap justify-content-center gap-2 mb-4">
                ${availableHours.map(hour => `<button class="btn btn-outline-gold time-slot">${hour}</button>`).join('')}
            </div>
            <div id="confirmation-form" class="d-none mt-4">
                <input type="text" id="client-name" class="form-control mb-2 bg-dark text-white border-gold text-center" placeholder="Enter Your Full Name" style="max-width: 300px; margin: 0 auto;">
                <button id="final-confirm" class="btn btn-gold w-100" style="max-width: 300px;">CONFIRM RESERVATION</button>
            </div>
        </div>
    `;

    // Lógica para elegir la hora
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            selectedTime = slot.innerText;
            // Marcamos el botón seleccionado
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active-slot'));
            slot.classList.add('active-slot');
            // Mostramos el input del nombre
            document.getElementById('confirmation-form').classList.remove('d-none');
        });
    });

    // Evento para el botón de confirmación final
    document.getElementById('final-confirm').addEventListener('click', confirmBooking);
}

// 4. Función para enviar los datos a Supabase
async function confirmBooking() {
    const nameInput = document.getElementById('client-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert("Please enter your name to continue.");
        return;
    }

    const btn = document.getElementById('final-confirm');
    const container = document.getElementById('booking-container');

    // Estado de carga
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        const { error } = await supabaseClient
            .from('appointments') 
            .insert([{ 
                client_name: name, 
                service_name: selectedService, 
                appointment_time: selectedTime 
            }]);

        if (error) throw error;

        // --- EFECTO DE DESAPARECER Y MENSAJE DE ÉXITO ---
        container.style.transition = "opacity 0.5s ease";
        container.style.opacity = "0";

        setTimeout(() => {
            container.innerHTML = `
                <div class="animate-fade-in text-center py-5">
                    <div class="mb-3">
                        <span style="font-size: 60px;">✅</span>
                    </div>
                    <h2 class="gold-text mb-2">Appointment Confirmed!</h2>
                    <p class="lead">Thank you, <strong>${name}</strong>.</p>
                    <p class="text-muted">We'll see you at <strong>${selectedTime}</strong> for your <strong>${selectedService}</strong>.</p>
                    <button class="btn btn-outline-gold mt-4" onclick="location.reload()">Book Another Service</button>
                </div>
            `;
            container.style.opacity = "1";
        }, 500);

    } catch (err) {
        console.error("Error:", err.message);
        alert("Something went wrong: " + err.message);
        btn.innerText = "CONFIRM RESERVATION";
        btn.disabled = false;
    }
}