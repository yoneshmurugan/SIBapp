import fs from 'fs';

const filePath = 'src/MainPage/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace("import TransferChapterAdmin from './TransferChapterAdmin.jsx'\n", "");
content = content.replace("import useFetch from '../hooks/useFetch.jsx'\n\n", "");

const fetchBlock = `  const { data: adminAccess } = useFetch(\n    \`\${import.meta.env.VITE_BACKEND_SERVER}/dashboard/isadmin\`,\n    { credentials: "include" }\n  );\n  \n`;
content = content.replace(fetchBlock, "");

const componentBlock = `          {adminAccess?.hasaccess && (\n            <TransferChapterAdmin />\n          )}\n`;
content = content.replace(componentBlock, "");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Reverted Dashboard.jsx');
