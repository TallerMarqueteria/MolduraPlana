document.addEventListener('DOMContentLoaded', () => {
    const materialMolduraSelect = document.getElementById('materialMoldura');
    const dimensionMolduraSelect = document.getElementById('dimensionMoldura');
    const insumosListDiv = document.getElementById('insumosList');
    const insumosAListDiv = document.getElementById('insumosAList');
    const calcularBtn = document.getElementById('calcularBtn');
    const detalleBtn = document.getElementById('detalleBtn');
    const ocultarDetalleBtn = document.getElementById('ocultarDetalleBtn');
    const resultadoDiv = document.getElementById('resultado');

    const factorDesperdicio = 1.1;
    const factorGanancia = 2.5;

    let moldurasData, insumosData, insumosAData;

    // Cargar y procesar los archivos CSV
    Promise.all([
        fetch('molduras.csv').then(response => response.text()),
        fetch('insumos.csv').then(response => response.text()),
        fetch('insumosA.csv').then(response => response.text())
    ]).then(([moldurasCsv, insumosCsv, insumosACsv]) => {
        moldurasData = parseCsv(moldurasCsv);
        insumosData = parseCsv(insumosCsv);
        insumosAData = parseCsv(insumosACsv);

        populateSelects();
        populateInsumos();
    });

    function parseCsv(data) {
        const [header, ...rows] = data.trim().split('\n').map(row => row.split(','));
        return { header, rows };
    }

    function populateSelects() {
        const materiales = moldurasData.header.slice(1); // Omitir "Dimensión"
        materiales.forEach(material => {
            const option = document.createElement('option');
            option.value = material;
            option.textContent = material;
            materialMolduraSelect.appendChild(option);
        });

        const dimensiones = moldurasData.rows.map(row => row[0]);
        dimensiones.forEach(dimension => {
            const option = document.createElement('option');
            option.value = dimension;
            option.textContent = dimension;
            dimensionMolduraSelect.appendChild(option);
        });
    }

    function populateInsumos() {
        const insumosGrouped = insumosData.rows.reduce((acc, row) => {
            const [insumo, opcion] = row;
            if (!acc[insumo]) acc[insumo] = [];
            acc[insumo].push(opcion);
            return acc;
        }, {});

        Object.keys(insumosGrouped).forEach(insumo => {
            const label = document.createElement('label');
            label.textContent = insumo;
            const select = document.createElement('select');
            insumosGrouped[insumo].forEach(opcion => {
                const option = document.createElement('option');
                option.value = opcion;
                option.textContent = opcion;
                select.appendChild(option);
            });
            insumosListDiv.appendChild(label);
            insumosListDiv.appendChild(select);
        });

        insumosAData.rows.forEach(([insumo]) => {
            const label = document.createElement('label');
            label.textContent = insumo;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = insumo;
            insumosAListDiv.appendChild(label);
            insumosAListDiv.appendChild(checkbox);
        });
    }

    function getSelectedOption(insumo) {
        const selects = insumosListDiv.querySelectorAll('select');
        for (const select of selects) {
            const label = select.previousElementSibling;
            if (label && label.textContent === insumo) {
                return select.value;
            }
        }
        return null;
    }

    calcularBtn.addEventListener('click', () => {
        const altoArte = parseFloat(document.getElementById('altoArte').value) || 0;
        const anchoArte = parseFloat(document.getElementById('anchoArte').value) || 0;
        const anchoPaspartu = parseFloat(document.getElementById('anchoPaspartu').value) || 0;
        const materialMoldura = materialMolduraSelect.value;
        const dimensionMoldura = dimensionMolduraSelect.value;
        const valorExtra = parseFloat(document.getElementById('valorExtra').value) || 0;
        const cantidad = parseInt(document.getElementById('cantidadEnmarcaciones').value) || 1;

        const altoReal = altoArte + 2 * anchoPaspartu;
        const anchoReal = anchoArte + 2 * anchoPaspartu;
        const perimetro = 2 * (altoReal + anchoReal);
        const area = altoReal * anchoReal;

        const molduraRow = moldurasData.rows.find(row => row[0] === dimensionMoldura);
        const precioMoldura = parseFloat(molduraRow[moldurasData.header.indexOf(materialMoldura)]) * perimetro;

        let precioInsumos = 0;
        insumosData.rows.forEach(([insumo, opcion, lineal, precio]) => {
            const selectedOpcion = getSelectedOption(insumo);
            if (opcion === selectedOpcion) {
                precioInsumos += parseFloat(precio) * (lineal === '1' ? perimetro : area);
            }
        });

        let precioInsumosA = 0;
        insumosAData.rows.forEach(([insumo, lineal, precio]) => {
            const checked = insumosAListDiv.querySelector(`input[type="checkbox"][value="${insumo}"]`).checked;
            if (checked) {
                precioInsumosA += parseFloat(precio);
            }
        });

        const costoTotal = precioMoldura + precioInsumos + precioInsumosA + valorExtra;
        const costoConDesperdicio = costoTotal * factorDesperdicio;
        const precioFinalUnitario = costoConDesperdicio * factorGanancia;
        const precioFinalTotal = precioFinalUnitario * cantidad;

        resultadoDiv.innerHTML = `
            <p>Precio Unitario: $${precioFinalUnitario.toFixed(2)}</p>
            <p>Precio Total (${cantidad} enmarcaciones): $${precioFinalTotal.toFixed(2)}</p>
        `;
    });

    detalleBtn.addEventListener('click', () => {
        const altoArte = parseFloat(document.getElementById('altoArte').value) || 0;
        const anchoArte = parseFloat(document.getElementById('anchoArte').value) || 0;
        const anchoPaspartu = parseFloat(document.getElementById('anchoPaspartu').value) || 0;
        const materialMoldura = materialMolduraSelect.value;
        const dimensionMoldura = dimensionMolduraSelect.value;
        const valorExtra = parseFloat(document.getElementById('valorExtra').value) || 0;
        const cantidad = parseInt(document.getElementById('cantidadEnmarcaciones').value) || 1;

        const altoReal = altoArte + 2 * anchoPaspartu;
        const anchoReal = anchoArte + 2 * anchoPaspartu;
        const perimetro = 2 * (altoReal + anchoReal);
        const area = altoReal * anchoReal;

        const molduraRow = moldurasData.rows.find(row => row[0] === dimensionMoldura);
        const precioMoldura = parseFloat(molduraRow[moldurasData.header.indexOf(materialMoldura)]) * perimetro;

        let precioInsumos = 0;
        insumosData.rows.forEach(([insumo, opcion, lineal, precio]) => {
            const selectedOpcion = getSelectedOption(insumo);
            if (opcion === selectedOpcion) {
                precioInsumos += parseFloat(precio) * (lineal === '1' ? perimetro : area);
            }
        });

        let precioInsumosA = 0;
        insumosAData.rows.forEach(([insumo, lineal, precio]) => {
            const checked = insumosAListDiv.querySelector(`input[type="checkbox"][value="${insumo}"]`).checked;
            if (checked) {
                precioInsumosA += parseFloat(precio);
            }
        });

        const costoTotal = precioMoldura + precioInsumos + precioInsumosA + valorExtra;
        const costoConDesperdicio = costoTotal * factorDesperdicio;
        const precioFinalUnitario = costoConDesperdicio * factorGanancia;
        const precioFinalTotal = precioFinalUnitario * cantidad;

        resultadoDiv.innerHTML = `
            <p>Costo Unitario (sin desperdicio): $${costoTotal.toFixed(2)}</p>
            <p>Costo Unitario (con desperdicio): $${costoConDesperdicio.toFixed(2)}</p>
            <p>Precio Unitario (con ganancia): $${precioFinalUnitario.toFixed(2)}</p>
            <p>Precio Total (${cantidad} enmarcaciones): $${precioFinalTotal.toFixed(2)}</p>
        `;

        detalleBtn.style.display = 'none';
        ocultarDetalleBtn.style.display = 'block';
    });

    ocultarDetalleBtn.addEventListener('click', () => {
        resultadoDiv.innerHTML = '';
        detalleBtn.style.display = 'block';
        ocultarDetalleBtn.style.display = 'none';
    });
});
