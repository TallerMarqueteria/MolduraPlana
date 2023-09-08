document.addEventListener("DOMContentLoaded", function () {
    // Crear objetos para las listas desplegables
    const tipoPaspartuOptions = {
        "N/A": 0,
        "Importado": 3.65,
        "Nacional": 1.43,
    };

    const tipoMolduraOptions = {
        "N/A": 0,
        "Marfil": 5,
        "Pino": 5,
        "Flormorado": 8,
        "Cedro": 8,
    };

    const acabadoOptions = {
        "N/A": 0,
        "Al Duco (<5cm)": 70,
        "Al Natural (<5cm)": 50,
        "Al Duco (>5cm)": 100,
        "Al Natural (>5cm)": 75,
    };

    const vidrioOptions = {
        "N/A": 0,
        "Corriente": 3.125,
        "Antirreflejo": 6.25,
    };

    const bastidorOptions = {
        "N/A": 0,
        "2x3": 25.86206897,
        "2x4": 29.31034483,
        "2x5": 32.75862069,
        "2x6": 36.20689655,
    };

    const respaldoOptions = {
        "N/A": 0,
        "MDF 3mm": 0.671862402579952,
        "MDF 4mm": 1.11977067096659,
        "Foamboard": 1.84027777777778,
        "Alucobond": 8.66666666666667,
        "FoamPVC 3mm": 2.08333333333333,
        "FoamPVC 6mm": 4.16666666666667,
        "FoamPVC 10mm": 8.33333333333333,
    };

    const CC_Adhesivo = 1.1;
    const CC_CintaDobleFaz = 7.5;
    const CC_Pisavidrio = 7.5;


    // Obtener elementos del formulario
    const cotizacionForm = document.getElementById("cotizacion-form");
    const calcularButton = document.getElementById("calcular-button");
    const precioUnitarioSpan = document.getElementById("precio-unitario");
    const precioTotalSpan = document.getElementById("precio-total");
    const variablesDiv = document.getElementById("variables");

    // Rellenar las listas desplegables con opciones desde los objetos
    const tipoPaspartuSelect = document.getElementById("tipo-paspartu");
    for (const option in tipoPaspartuOptions) {
        const optionElement = document.createElement("option");
        optionElement.value = tipoPaspartuOptions[option];
        optionElement.text = option;
        tipoPaspartuSelect.appendChild(optionElement);
    }

    const tipoMolduraSelect = document.getElementById("tipo-moldura");
    for (const option in tipoMolduraOptions) {
        const optionElement = document.createElement("option");
        optionElement.value = tipoMolduraOptions[option];
        optionElement.text = option;
        tipoMolduraSelect.appendChild(optionElement);
    }

    const acabadoSelect = document.getElementById("acabado");
    for (const option in acabadoOptions) {
        const optionElement = document.createElement("option");
        optionElement.value = acabadoOptions[option];
        optionElement.text = option;
        acabadoSelect.appendChild(optionElement);
    }

    const vidrioSelect = document.getElementById("vidrio");
    for (const option in vidrioOptions) {
        const optionElement = document.createElement("option");
        optionElement.value = vidrioOptions[option];
        optionElement.text = option;
        vidrioSelect.appendChild(optionElement);
    }

    const bastidorSelect = document.getElementById("bastidor");
    for (const option in bastidorOptions) {
        const optionElement = document.createElement("option");
        optionElement.value = bastidorOptions[option];
        optionElement.text = option;
        bastidorSelect.appendChild(optionElement);
    }

    const respaldoSelect = document.getElementById("respaldo");
    for (const option in respaldoOptions) {
        const optionElement = document.createElement("option");
        optionElement.value = respaldoOptions[option];
        optionElement.text = option;
        respaldoSelect.appendChild(optionElement);
    }

    calcularButton.addEventListener("click", function () {
        // Obtener valores del formulario y realizar cálculos
        const cantidad = parseFloat(document.getElementById("cantidad").value);
        const altoArte = parseFloat(document.getElementById("alto-arte").value);
        const anchoArte = parseFloat(document.getElementById("ancho-arte").value);
        const anchoPaspartu = parseFloat(document.getElementById("ancho-paspartu").value);
        const altoMoldura = parseFloat(document.getElementById("alto-moldura").value);
        const anchoMoldura = parseFloat(document.getElementById("ancho-moldura").value);
        const pisavidrio = document.getElementById("pisavidrio").checked;
        const cintaDobleFaz = document.getElementById("cinta-doble-faz").checked;
        const adhesivo = document.getElementById("adhesivo").checked;
    
        const tipoPaspartu = parseFloat(tipoPaspartuSelect.value);
        const tipoMoldura = parseFloat(tipoMolduraSelect.value);
        const acabado = parseFloat(acabadoSelect.value);
        const vidrio = parseFloat(vidrioSelect.value);
        const bastidor = parseFloat(bastidorSelect.value);
        const respaldo = parseFloat(respaldoSelect.value);
    
        const F_Ganancia = 2.4;
        const F_Desperdicio = 1.1; // Factor de desperdicio ajustado a 1.1
    
        const per_bruto = 2 * (altoArte + anchoArte);
        const area_bruto = altoArte * anchoArte;
        const per_total = (altoArte + 2 * anchoPaspartu +anchoArte)*2;
        const area_total = (altoArte + 2 * anchoPaspartu) * (anchoArte + 2 * anchoPaspartu);
    
        const C_Tira = altoMoldura*anchoMoldura*300*tipoMoldura+3000+1000;
        const C_Moldura = (per_total/290)*C_Tira;
        const C_Acabado = per_total * acabado;
        const C_Adhesivo = area_total * (adhesivo ? 1 : 0) * CC_Adhesivo;
        const C_Bastidor = per_total * bastidor;
        const C_CDobleFaz = per_total * (cintaDobleFaz ? 1 : 0) * CC_CintaDobleFaz;
        const C_Paspartu = area_total * tipoPaspartu;
        const C_Pisavididrio = per_total * (pisavidrio ? 1 : 0) * CC_Pisavidrio;
        const C_Respaldo = area_total * respaldo;
        const C_Vidrio = area_total * vidrio;
        const C_Colgadera = 500;
        const C_Embalaje = area_total * 0.3;
        const C_Cinta = per_total * 2.5;
    
        const Costo_Bruto = C_Moldura + C_Acabado + C_Adhesivo + C_Bastidor + C_CDobleFaz + C_Paspartu + C_Pisavididrio + C_Respaldo + C_Vidrio + C_Colgadera + C_Embalaje + C_Cinta;
        const Costo_Desperdicio = Costo_Bruto * F_Desperdicio;
        const Costo_Total = Costo_Desperdicio * F_Ganancia;
        const Precio = Math.round(Costo_Total / 500) * 500;
    
        // Formatear el precio final y el precio total con separadores de miles
        const precioFormateado = Precio.toLocaleString("es-ES");
        const precioTotalFormateado = (Precio * cantidad).toLocaleString("es-ES");
    
        // Mostrar resultados
        document.getElementById("precio-unitario").textContent = `Precio unitario: $ ${precioFormateado}`;
        document.getElementById("precio-total").textContent = `Precio total: $ ${precioTotalFormateado}`;
    
        // Mostrar variables (opcional)
        variablesDiv.innerHTML = `<pre>${JSON.stringify(
            {
                F_Ganancia,
                F_Desperdicio,
                per_bruto,
                area_bruto,
                per_total,
                area_total,
                C_Moldura,
                C_Acabado,
                C_Adhesivo,
                C_Bastidor,
                C_CDobleFaz,
                C_Paspartu,
                C_Pisavididrio,
                C_Respaldo,
                C_Vidrio,
                C_Colgadera,
                C_Embalaje,
                C_Cinta,
                Costo_Bruto,
                Costo_Total,
                Precio,
            },
            null,
            2
        )}</pre>`;
        variablesDiv.style.display = "block";
    });      
});
