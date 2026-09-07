import fs from 'fs';

const filePath = 'src/MainPage/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

const importReplacement = `import TransferChapterAdmin from './TransferChapterAdmin.jsx'\nimport useFetch from '../hooks/useFetch.jsx'\n\nfunction Dashboard() {`;
content = content.replace('function Dashboard() {', importReplacement);

const fetchReplacement = `function Dashboard() {\n  const { data: adminAccess } = useFetch(\n    \`\${import.meta.env.VITE_BACKEND_SERVER}/dashboard/isadmin\`,\n    { credentials: "include" }\n  );\n`;
content = content.replace('function Dashboard() {', fetchReplacement);

const componentReplacement = `<div className="lg:hidden">\n            <UserInfo />\n          </div>\n          {adminAccess?.hasaccess && (\n            <TransferChapterAdmin />\n          )}\n          <ChapterOverview />`;
content = content.replace(`<div className="lg:hidden">\n            <UserInfo />\n          </div>\n          <ChapterOverview />`, componentReplacement);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully patched Dashboard.jsx');
