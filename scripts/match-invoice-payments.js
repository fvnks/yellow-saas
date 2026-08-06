const fs = require('fs');
const path = require('path');
const readline = require('readline');
const XLSX = require('xlsx');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, defaultValue) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function formatCLP(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

function parseAmount(value) {
  if (typeof value === 'number') return value;
  const cleaned = String(value)
    .replace(/[.]/g, '')
    .replace(/[,]/g, '.')
    .replace(/[^\d.-]/g, '');
  return parseFloat(cleaned);
}

function findCombinations(invoices, target, minSize = 2, maxResults = 200) {
  const results = [];
  const sorted = [...invoices].sort((a, b) => a.amount - b.amount);
  const n = sorted.length;
  const amounts = sorted.map((i) => i.amount);

  function backtrack(start, currentSum, currentCombo) {
    if (results.length >= maxResults) return;
    if (currentCombo.length >= minSize && Math.abs(currentSum - target) < 0.5) {
      results.push([...currentCombo]);
      return;
    }
    if (currentSum >= target + 0.5) return;

    for (let i = start; i < n; i++) {
      if (currentSum + amounts[i] > target + 0.5) break;
      if (i > start && amounts[i] === amounts[i - 1]) continue;
      currentCombo.push(sorted[i]);
      backtrack(i + 1, currentSum + amounts[i], currentCombo);
      currentCombo.pop();
      if (results.length >= maxResults) return;
    }
  }

  backtrack(0, 0, []);
  return results;
}

async function main() {
  console.log('\n=== MATCH DE PAGOS POR DEPÓSITO ===\n');

  const filePath =
    (await ask(
      '📁 Ruta del archivo Excel (presiona Enter para usar "facturas.xlsx" en el directorio actual): '
    )) || 'facturas.xlsx';

  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`\n❌ No se encontró el archivo: ${fullPath}`);
    rl.close();
    process.exit(1);
  }

  const workbook = XLSX.readFile(fullPath);
  const sheetNames = workbook.SheetNames;

  console.log('\n📊 Hojas disponibles:');
  sheetNames.forEach((name, idx) => {
    console.log(`   ${idx + 1}. ${name}`);
  });

  let sheetName;
  if (sheetNames.length === 1) {
    sheetName = sheetNames[0];
    console.log(`\n🔄 Usando la única hoja disponible: "${sheetName}"`);
  } else {
    const sheetIdx =
      parseInt(
        await ask(`\n🔄 Ingresa el número de la hoja a usar (1-${sheetNames.length}): `)
      ) - 1;
    sheetName = sheetNames[sheetIdx];
  }

  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

  console.log('\n📋 Primeras 10 filas de la hoja:');
  console.log('   ' + '─'.repeat(80));
  data.slice(0, 10).forEach((row, idx) => {
    const cells = row
      .slice(0, 8)
      .map((c) => (c !== undefined ? String(c) : ''))
      .join(' | ');
    console.log(`   Fila ${idx + 1}: ${cells}`);
  });
  console.log('   ' + '─'.repeat(80));

  const headerRowNum = parseInt(
    await ask(
      '\n📍 ¿En qué fila están los encabados de las columnas? (presiona Enter si es la fila 1): ',
      '1'
    )
  );

  const headerRowIndex = headerRowNum - 1;
  const headers = data[headerRowIndex] || [];
  if (headers.length === 0) {
    console.error('\n❌ No se pudieron leer los encabados de la fila especificada.');
    rl.close();
    process.exit(1);
  }

  console.log('\n📝 Encabados detectados:');
  headers.forEach((h, idx) => {
    if (h !== undefined && h !== '') {
      console.log(`   Columna ${idx + 1} (${String.fromCharCode(65 + idx)}): ${h}`);
    }
  });

  const amountColIdx =
    parseInt(
      await ask(
        '\n💰 ¿Qué número de columna contiene los montos? (ej: 1, 2, 3...): '
      )
    ) - 1;

  const invoiceColIdx =
    parseInt(
      await ask('\n🧾 ¿Qué número de columna contiene los números de factura?: ')
    ) - 1;

  const dataStart = headerRowIndex + 1;
  const invoices = [];

  for (let i = dataStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const amount = parseAmount(row[amountColIdx]);
    const invoiceNum = row[invoiceColIdx];

    if (!isNaN(amount) && amount > 0 && invoiceNum !== undefined && invoiceNum !== '') {
      invoices.push({
        invoice: String(invoiceNum),
        amount: amount,
        row: i + 1,
      });
    }
  }

  if (invoices.length === 0) {
    console.error('\n❌ No se encontraron facturas con montos válidos.');
    rl.close();
    process.exit(1);
  }

  console.log(`\n✅ Se cargaron ${invoices.length} facturas:`);
  console.log('   ' + '─'.repeat(70));
  invoices.forEach((inv) => {
    console.log(`   Factura ${inv.invoice}: ${formatCLP(inv.amount)} (fila ${inv.row})`);
  });
  console.log('   ' + '─'.repeat(70));

  const depositStr = await ask(
    '\n💵 Ingresa el monto del depósdito que deseas conciliar: '
  );
  const depositAmount = parseAmount(depositStr);

  if (isNaN(depositAmount) || depositAmount <= 0) {
    console.error('\n❌ Monto inválido.');
    rl.close();
    process.exit(1);
  }

  console.log(`\n🔍 Buscando combinaciones de 2 o más facturas que sumen ${formatCLP(depositAmount)}...`);

  if (invoices.length > 25) {
    console.log(
      `   ⚠️  Advertencia: Hay ${invoices.length} facturas. La búsqueda puede tardar.`
    );
    const proceed = await ask('   ¿Continuar? (s/n): ', 's');
    if (proceed.toLowerCase() !== 's') {
      console.log('\n❌ Operación cancelada.');
      rl.close();
      process.exit(0);
    }
  }

  const combinations = findCombinations(invoices, depositAmount, 2);

  if (combinations.length === 0) {
    console.log('\n❌ No se encontró ninguna combinación de facturas que coincidence con el depósdito.');
  } else {
    console.log(`\n✅ ¡Se encontraron ${combinations.length} coincidencia(s):\n`);
    combinations.forEach((combo, idx) => {
      const total = combo.reduce((sum, inv) => sum + inv.amount, 0);
      console.log(`   ${idx + 1}. ${formatCLP(total)}`);
      combo.forEach((inv) => {
        console.log(`      • Factura ${inv.invoice}: ${formatCLP(inv.amount)} (fila ${inv.row})`);
      });
      console.log('');
    });
  }

  rl.close();
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  rl.close();
  process.exit(1);
});
