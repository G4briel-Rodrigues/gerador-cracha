// ADEUS CHAVE DE API! AGORA É 100% GRÁTIS E INFINITO! 🎉

const modeloImg = new Image();
modeloImg.src = 'modelo3.0.png';

let fotoAtual = null;
let isDrawing = false;
let eraserPaths = [];
let currentStroke = [];

async function processarFoto() {
    const fileInput = document.getElementById('fotoInput').files[0];
    if (!fileInput) {
        alert("Selecione uma foto primeiro.");
        return;
    }

    const msg = document.getElementById('loadingMsg');
    msg.style.display = 'block';

    try {
        // ==========================================
        // A MÁGICA DA IA (Com a bússola configurada!)
        // ==========================================
        const config = {
            // Isso força a IA a baixar o cérebro do servidor oficial deles, 
            // em vez de procurar na sua hospedagem local (127.0.0.1).
            publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.4.5/dist/"
        };
        
        // Passamos a configuração junto com a foto
        const blob = await imglyRemoveBackground(fileInput, config);
        const fotoSemFundoUrl = URL.createObjectURL(blob);
        
        fotoAtual = new Image();
        fotoAtual.src = fotoSemFundoUrl;
        
        fotoAtual.onload = () => {
            document.getElementById('zoomInput').value = 1;
            document.getElementById('moveXInput').value = 0;
            document.getElementById('moveYInput').value = 0;
            
            limparBorracha(); 
            msg.style.display = 'none';
        };
    } catch (error) {
        console.error(error);
        alert("Erro ao remover o fundo! Verifique sua conexão ou olhe o console (F12).");
        msg.style.display = 'none';
    }
}

// ==========================================
// MATEMÁTICA DA BORRACHA 
// ==========================================
function getFotoTransform() {
    const canvas = document.getElementById('previewCanvas');
    const centroX = canvas.width / 2;
    const centroY = 880;              
    const zoom = parseFloat(document.getElementById('zoomInput').value);
    const moveX = parseInt(document.getElementById('moveXInput').value);
    const moveY = parseInt(document.getElementById('moveYInput').value);
    const tamanhoBase = 780; 
    
    let scale = 1;
    if (fotoAtual) {
        scale = Math.max(tamanhoBase / fotoAtual.width, tamanhoBase / fotoAtual.height) * zoom;
    }
    
    const newWidth = fotoAtual ? fotoAtual.width * scale : 0;
    const newHeight = fotoAtual ? fotoAtual.height * scale : 0;
    
    const offsetX = (centroX - (newWidth / 2)) + moveX;
    const offsetY = (centroY - (newHeight / 2)) + moveY;
    
    return { scale, offsetX, offsetY, newWidth, newHeight };
}

function addPoint(e) {
    const canvas = document.getElementById('previewCanvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const transform = getFotoTransform();
    
    const localX = (mouseX - transform.offsetX) / transform.scale;
    const localY = (mouseY - transform.offsetY) / transform.scale;
    
    const size = document.getElementById('brushSize').value;
    const soft = document.getElementById('brushSoft').value; 
    
    currentStroke.push({x: localX, y: localY, size: size, soft: soft}); 
    renderizarPreview();
}

function iniciarEventosBorracha() {
    const canvas = document.getElementById('previewCanvas');
    
    canvas.addEventListener('mousedown', (e) => {
        if(!fotoAtual) return;
        isDrawing = true;
        addPoint(e);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) addPoint(e);
    });
    
    window.addEventListener('mouseup', () => {
        if (isDrawing) {
            isDrawing = false;
            if (currentStroke.length > 0) {
                eraserPaths.push([...currentStroke]);
                currentStroke = [];
            }
        }
    });
}

function limparBorracha() {
    eraserPaths = [];
    currentStroke = [];
    renderizarPreview();
}

function renderizarPreview() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = modeloImg.width;
    canvas.height = modeloImg.height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (fotoAtual) {
        const fotoCanvas = document.createElement('canvas');
        fotoCanvas.width = canvas.width;
        fotoCanvas.height = canvas.height;
        const fotoCtx = fotoCanvas.getContext('2d');

        const { scale, offsetX, offsetY, newWidth, newHeight } = getFotoTransform();

        fotoCtx.drawImage(fotoAtual, offsetX, offsetY, newWidth, newHeight);

        fotoCtx.globalCompositeOperation = 'destination-out';
        fotoCtx.lineCap = 'round';
        fotoCtx.lineJoin = 'round';

        fotoCtx.save();
        fotoCtx.translate(offsetX, offsetY);
        fotoCtx.scale(scale, scale);

        const drawStroke = (stroke) => {
            if (stroke.length === 0) return;
            fotoCtx.beginPath();
            
            fotoCtx.lineWidth = stroke[0].size / scale; 
            fotoCtx.shadowBlur = stroke[0].soft / scale; 
            fotoCtx.shadowColor = 'black'; 
            fotoCtx.strokeStyle = 'black'; 
            
            fotoCtx.moveTo(stroke[0].x, stroke[0].y);
            for (let i = 1; i < stroke.length; i++) {
                fotoCtx.lineTo(stroke[i].x, stroke[i].y);
            }
            fotoCtx.stroke();
        };

        eraserPaths.forEach(drawStroke);
        drawStroke(currentStroke);
        fotoCtx.restore();

        ctx.drawImage(fotoCanvas, 0, 0);
    }

    ctx.drawImage(modeloImg, 0, 0, canvas.width, canvas.height);

    const nome = document.getElementById('nomeInput').value.trim().toUpperCase();
    const setor = document.getElementById('setorInput').value.trim().toUpperCase();

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    const eixoXTexto = (canvas.width / 2) - 15; 
    
    ctx.font = 'bold 95px "Montserrat", sans-serif'; 
    ctx.fillText(nome, eixoXTexto, 1550, canvas.width * 0.85); 
    
    ctx.font = '300 70px "Montserrat", sans-serif'; 
    ctx.fillText(setor, eixoXTexto, 1640, canvas.width * 0.85); 
}

function adicionarNaFolha() {
    if (!fotoAtual) {
        alert("Carregue uma foto e aguarde o processamento antes de adicionar.");
        return;
    }

    const previewCanvas = document.getElementById('previewCanvas');
    const folhaA4 = document.getElementById('folhaA4');

    const divCracha = document.createElement('div');
    divCracha.className = 'cracha-item';

    const novoCracha = document.createElement('canvas');
    novoCracha.width = previewCanvas.width;
    novoCracha.height = previewCanvas.height;
    
    const ctx = novoCracha.getContext('2d');
    ctx.drawImage(previewCanvas, 0, 0);

    const btnExcluir = document.createElement('span'); 
    btnExcluir.className = 'btn-excluir';
    btnExcluir.innerHTML = '🗑️'; 
    btnExcluir.title = "Remover este crachá";
    
    btnExcluir.onclick = function() {
        divCracha.remove(); 
    };

    divCracha.appendChild(novoCracha);
    divCracha.appendChild(btnExcluir);
    folhaA4.appendChild(divCracha);

    document.getElementById('fotoInput').value = '';
    document.getElementById('nomeInput').value = '';
    document.getElementById('setorInput').value = '';
    fotoAtual = null;
    limparBorracha(); 
}

function exportarFolha() {
    const folha = document.getElementById('folhaA4');
    
    const botoesExcluir = document.querySelectorAll('.btn-excluir');
    botoesExcluir.forEach(btn => {
        btn.style.setProperty('display', 'none', 'important');
    });
    
    html2canvas(folha, { scale: 3.12342 }).then(canvas => { 
        const link = document.createElement('a');
        link.download = 'crachas_prontos_grafica.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        botoesExcluir.forEach(btn => {
            btn.style.setProperty('display', 'inline-block', 'important');
        });
    });
}

window.onload = () => {
    iniciarEventosBorracha();
    setTimeout(renderizarPreview, 500); 
};