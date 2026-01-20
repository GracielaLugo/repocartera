const clientsTable = document.getElementById('clients-table');
const totalClientesEl = document.getElementById('total-clientes');
const deudaTotalEl = document.getElementById('deuda-total');
const promedioDeudaEl = document.getElementById('promedio-deuda');
const updateModal = document.getElementById('update-modal');
const updateForm = document.getElementById('update-form');

async function fetchData() {
    try {
        // Cargar Resumen
        const resResumen = await fetch('/api/resumen');
        const resumen = await resResumen.json();

        if (resumen.status === 'success') {
            totalClientesEl.innerText = resumen.resumen.total_clientes;
            deudaTotalEl.innerText = `$${parseFloat(resumen.resumen.deuda_total).toLocaleString()}`;

            const promedio = resumen.resumen.total_clientes > 0
                ? (resumen.resumen.deuda_total / resumen.resumen.total_clientes).toFixed(2)
                : 0;
            promedioDeudaEl.innerText = `$${parseFloat(promedio).toLocaleString()}`;
        }

        // Cargar Lista de Clientes
        const resClientes = await fetch('/api/clientes');
        const clientesData = await resClientes.json();

        if (clientesData.status === 'success') {
            renderTable(clientesData.data);
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        alert('Error al conectar con el servidor.');
    }
}

function renderTable(clientes) {
    clientsTable.innerHTML = '';
    clientes.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${c.id}</td>
            <td class="font-bold">${c.nombre}</td>
            <td>$${parseFloat(c.deuda).toLocaleString()}</td>
            <td>
                <button class="btn-action" onclick="openModal(${c.id}, '${c.nombre}', ${c.deuda})">
                    Actualizar
                </button>
            </td>
        `;
        clientsTable.appendChild(row);
    });
}

function openModal(id, nombre, deuda) {
    document.getElementById('client-id-modal').value = id;
    document.getElementById('client-name-modal').innerText = nombre;
    document.getElementById('new-debt').value = deuda;
    updateModal.classList.add('active');
}

function closeModal() {
    updateModal.classList.remove('active');
}

updateForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('client-id-modal').value;
    const nombre = document.getElementById('client-name-modal').innerText;
    const deuda = document.getElementById('new-debt').value;

    try {
        const res = await fetch(`/api/clientes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, deuda: parseFloat(deuda) })
        });

        const result = await res.json();
        if (result.status === 'success') {
            alert('¡Actualizado con éxito!');
            closeModal();
            fetchData();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Error al actualizar.');
    }
};

// Carga inicial
fetchData();
