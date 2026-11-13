/**
 * URL oficial fixa do logotipo institucional (4º BBM)
 */
export const FIXED_LOGO_URL =
  'https://lh3.googleusercontent.com/d/1ainqF3s91Szqyx7pcr6RUGCeLFRh4c8j';

/**
 * Fallback vetorial caso o usuário esteja 100% offline sem acesso à URL externa
 */
export const FALLBACK_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%231e293b"/></linearGradient></defs><polygon points="50,5 90,20 90,55 50,95 10,55 10,20" fill="url(%23g)" stroke="%2338bdf8" stroke-width="2.5"/><polygon points="50,14 82,26 82,52 50,84 18,52 18,26" fill="none" stroke="%2394a3b8" stroke-dasharray="3,2" stroke-width="1.5"/><path d="M50 24 L56 38 L72 38 L59 48 L64 64 L50 54 L36 64 L41 48 L28 38 L44 38 Z" fill="%23f8fafc" stroke="%2338bdf8" stroke-width="1"/><circle cx="50" cy="50" r="3" fill="%230ea5e9"/></svg>`;

/**
 * Converte a imagem da URL fixa para Base64 PNG otimizado para o pdfmake,
 * preservando proporção e transparência sem inflar o tamanho do arquivo PDF.
 */
export async function loadFixedLogoBase64(): Promise<string> {
  try {
    const response = await fetch(FIXED_LOGO_URL, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 240;
          const scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight, 1);
          const w = Math.max(1, Math.round(img.naturalWidth * scale));
          const h = Math.max(1, Math.round(img.naturalHeight * scale));

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Canvas context unavailable'));
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Falha ao decodificar imagem da logo'));
      };
      img.src = objectUrl;
    });
  } catch {
    // Fallback para SVG convertido em PNG se estiver offline
    return await new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 120, 120);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = FALLBACK_LOGO_SVG;
    });
  }
}

/**
 * Exemplo pronto para colar diretamente (formato TSV — cópia direta de tabela da web ou planilha).
 * Contém exatamente as 9 colunas solicitadas:
 * NÚMERO ; DATA REGISTRO ; STATUS ; DATA FATO ; UNIDADES ATUAL ; NATUREZAS ; MUNICÍPIO ; BAIRRO ; LOGRADOURO
 */
export const SAMPLE_TSV_SOURCE = [
  ['NÚMERO', 'DATA REGISTRO', 'STATUS', 'DATA FATO', 'UNIDADES ATUAL', 'NATUREZAS', 'MUNICÍPIO', 'BAIRRO', 'LOGRADOURO'].join('\t'),
  ['2026-08912', '13/11/2026 06:42', 'Concluído', '13/11/2026 06:15', '1º Pelotão / ABT-14', '61201 - TERRENO BALDIO, LOTE VAGO OU SIMILAR', 'Patos de Minas', 'Centro', 'Rua Major Gote, 840'].join('\t'),
  ['2026-08911', '13/11/2026 05:50', 'Em Andamento', '13/11/2026 05:32', 'UR-08 / Resgate', '30113 - QUEDA DE MOTO; 30406 - HEMORRAGIA', 'Patos de Minas', 'Sobradinho', 'Av. Fátima Porto, 1420'].join('\t'),
  ['2026-08910', '13/11/2026 03:15', 'Concluído', '13/11/2026 02:50', 'AS-04 / Salvamento', '40411 - EVENTOS ENVOLVENDO ÁRVORES', 'Lagoa Formosa', 'Novo Horizonte', 'Rua Juca Limoeiro, 310'].join('\t'),
  ['2026-08909', '13/11/2026 01:04', 'Pendente', '13/11/2026 00:40', '2º Pelotão / Prevenção', '80103 - VAZAMENTO', 'Carmo do Paranaíba', 'Paranaíba', 'Rua Governador Valadares, 620'].join('\t'),
  ['2026-08908', '12/11/2026 22:32', 'Concluído', '12/11/2026 22:05', 'UR-08 / Resgate', '30402 - CONVULSÃO', 'Patos de Minas', 'Cristavo', 'Av. JK, 1950'].join('\t'),
  ['2026-08907', '12/11/2026 20:48', 'Concluído', '12/11/2026 20:15', 'ABT-14 / Combate', '60509 - Unifamiliar casa', 'Presidente Olegário', 'Centro', 'Praça Independência, 112'].join('\t'),
  ['2026-08906', '12/11/2026 18:14', 'Concluído', '12/11/2026 17:50', 'AS-04 / Salvamento', '40105 - SILVESTRE', 'Patos de Minas', 'Bela Vista', 'Rua Dona Luiza, 480'].join('\t'),
  ['2026-08905', '12/11/2026 15:30', 'Concluído', '12/11/2026 15:05', 'UR-08 / Resgate', '30105 - CARRO X BICICLETA', 'Patos de Minas', 'Vila Garcia', 'Av. Marabá, 2200'].join('\t'),
  ['2026-08904', '12/11/2026 13:05', 'Em Andamento', '12/11/2026 12:30', 'Guarnição de Vistoria', '90102 - INSPEÇÃO', 'São Gotardo', 'Guarda dos Ferreiros', 'Av. Brasil, 740'].join('\t'),
  ['2026-08903', '12/11/2026 10:42', 'Concluído', '12/11/2026 10:15', 'ABT-14 / Combate', '60219 - Loja de departamentos/mercado', 'Patos de Minas', 'Ipanema', 'Rua Vereador João Pacheco, 1105'].join('\t'),
].join('\n');

export const SAMPLE_HTML_SOURCE = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Ocorrências</title></head>
<body>
  <table border="1">
    <thead>
      <tr>
        <th>NÚMERO</th>
        <th>DATA REGISTRO</th>
        <th>STATUS</th>
        <th>DATA FATO</th>
        <th>UNIDADES ATUAL</th>
        <th>NATUREZAS</th>
        <th>MUNICÍPIO</th>
        <th>BAIRRO</th>
        <th>LOGRADOURO</th>
      </tr>
    </thead>
    <tbody>
      ${SAMPLE_TSV_SOURCE.split('\n')
        .slice(1)
        .map((line) => `<tr>${line.split('\t').map((c) => `<td>${c}</td>`).join('')}</tr>`)
        .join('\n      ')}
    </tbody>
  </table>
</body>
</html>`;
