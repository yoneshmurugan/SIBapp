import fs from 'fs';

const filePath = 'src/MainPage/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The block to remove
const block = `  const { data: adminAccess } = useFetch(
    \`\${import.meta.env.VITE_BACKEND_SERVER}/dashboard/isadmin\`,
    { credentials: "include" }
  );`;

content = content.replace(block, "");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed Dashboard.jsx');
