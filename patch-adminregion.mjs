import fs from 'fs';

const filePath = 'src/Admin/Components/AdminRegion.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Insert import at the top
const importReplacement = `import TransferChapterAdmin from '../../MainPage/TransferChapterAdmin.jsx';\nimport { useNavigate } from 'react-router-dom';`;
content = content.replace("import { useNavigate } from 'react-router-dom';", importReplacement);

// Insert component above regions grid
const componentInjectionPoint = `{/* --- Main Dashboard Container --- */}\n        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">\n          <TransferChapterAdmin />`;
content = content.replace(`{/* --- Main Dashboard Container --- */}\n        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">`, componentInjectionPoint);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully patched AdminRegion.jsx');
