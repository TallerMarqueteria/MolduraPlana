document.addEventListener('DOMContentLoaded', () => {
    const materialMolduraSelect = document.getElementById('materialMoldura');
    const dimensionMolduraSelect = document.getElementById('dimensionMoldura');
    const insumosListDiv = document.getElementById('insumosList');
    const insumosAListDiv = document.getElementById('insumosAList');
    const calcularBtn = document.getElementById('calcularBtn');
    const detalleBtn = document.getElementById('detalleBtn');
    const ocultarDetalleBtn = document.getElementById('ocultarDetalleBtn');
    const resultadoDiv = document.getElementById('resultado');
    const cantidadInput = document.getElementById('cantidad');

    const factorDesperdicio = 1.1;
    const factorGanancia = 2.5;

    let moldurasData, insumosData, insumosAData;

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
        const materiales = moldurasData.header.slice(1);
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

    // Formatear precios con separador de miles y sin decimales
    function formatPrice(value) {
        return `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
    }

    calcularBtn.addEventListener('click', () => {
        const altoArte = parseFloat(document.getElementById('altoArte').value) || 0;
        const anchoArte = parseFloat(document.getElementById('anchoArte').value) || 0;
        const anchoPaspartu = parseFloat(document.getElementById('anchoPaspartu').value) || 0;
        const materialMoldura = materialMolduraSelect.value;
        const dimensionMoldura = dimensionMolduraSelect.value;
        const valorExtra = parseFloat(document.getElementById('valorExtra').value) || 0;
        const cantidad = parseInt(cantidadInput.value) || 1;

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
                precioInsumosA += parseFloat(precio) * (lineal === '1' ? perimetro : lineal === '0' ? area : 1);
            }
        });

        const precioUnitario = (precioMoldura + precioInsumos + precioInsumosA + valorExtra) * factorDesperdicio * factorGanancia;
        const precioTotal = precioUnitario * cantidad;

        resultadoDiv.innerHTML = `
            <p><span>Precio Unitario:</span> ${formatPrice(precioUnitario)}</p>
            <p><span>Precio Total:</span> ${formatPrice(precioTotal)}</p>
        `;
    });

    detalleBtn.addEventListener('click', () => {
        const altoArte = parseFloat(document.getElementById('altoArte').value) || 0;
        const anchoArte = parseFloat(document.getElementById('anchoArte').value) || 0;
        const anchoPaspartu = parseFloat(document.getElementById('anchoPaspartu').value) || 0;
        const materialMoldura = materialMolduraSelect.value;
        const dimensionMoldura = dimensionMolduraSelect.value;
        const valorExtra = parseFloat(document.getElementById('valorExtra').value) || 0;
        const cantidad = parseInt(cantidadInput.value) || 1;

        const altoReal = altoArte + 2 * anchoPaspartu;
        const anchoReal = anchoArte + 2 * anchoPaspartu;
        const perimetro = 2 * (altoReal + anchoReal);
        const area = altoReal * anchoReal;

        const molduraRow = moldurasData.rows.find(row => row[0] === dimensionMoldura);
        const precioMoldura = parseFloat(molduraRow[moldurasData.header.indexOf(materialMoldura)]) * perimetro;

        let precioInsumos = 0;
        let detallesInsumos = '';
        insumosData.rows.forEach(([insumo, opcion, lineal, precio]) => {
            const selectedOpcion = getSelectedOption(insumo);
            if (opcion === selectedOpcion) {
                const costo = parseFloat(precio) * (lineal === '1' ? perimetro : area);
                precioInsumos += costo;
                detallesInsumos += `${insumo} - ${opcion}: ${formatPrice(costo)}\n`;
            }
        });

        let precioInsumosA = 0;
        let detallesInsumosA = '';
        insumosAData.rows.forEach(([insumo, lineal, precio]) => {
            const checked = insumosAListDiv.querySelector(`input[type="checkbox"][value="${insumo}"]`).checked;
            if (checked) {
                const costo = parseFloat(precio) * (lineal === '1' ? perimetro : lineal === '0' ? area : 1);
                precioInsumosA += costo;
                detallesInsumosA += `${insumo}: ${formatPrice(costo)}\n`;
            }
        });

        const precioUnitario = (precioMoldura + precioInsumos + precioInsumosA + valorExtra) * factorDesperdicio * factorGanancia;
        const precioTotal = precioUnitario * cantidad;

        resultadoDiv.innerText = `
        Detalle de la Cotización:\n
        Precio Moldura: ${formatPrice(precioMoldura)}\n
        ${detallesInsumos}
        ${detallesInsumosA}
        Valor Extra: ${formatPrice(valorExtra)}\n
        Precio Unitario (sin desperdicio): ${formatPrice(precioMoldura + precioInsumos + precioInsumosA + valorExtra)}\n
        Precio Unitario (con desperdicio): ${formatPrice((precioMoldura + precioInsumos + precioInsumosA + valorExtra) * factorDesperdicio)}\n
        Precio Unitario (con ganancia): ${formatPrice(precioUnitario)}\n
        Precio Total: ${formatPrice(precioTotal)}
        `;

        detalleBtn.style.display = 'none';
        ocultarDetalleBtn.style.display = 'inline';
    });

    ocultarDetalleBtn.addEventListener('click', () => {
        resultadoDiv.textContent = '';
        detalleBtn.style.display = 'inline';
        ocultarDetalleBtn.style.display = 'none';
    });
});
