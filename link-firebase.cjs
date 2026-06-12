const xcode = require('xcode');
const fs = require('fs');

const projectPath = 'ios/App/App.xcodeproj/project.pbxproj';
const myProj = xcode.project(projectPath);

myProj.parseSync();

// --- THE BUG FIX ---
// We manually create the 'Resources' group in memory so the 
// xcode library doesn't crash when it searches for it.
if (!myProj.pbxGroupByName('Resources')) {
    myProj.pbxCreateGroup('Resources', 'Resources');
}

// Tell Xcode to officially track the Firebase file
myProj.addResourceFile('GoogleService-Info.plist', { target: myProj.getFirstTarget().uuid });
fs.writeFileSync(projectPath, myProj.writeSync());

console.log('GoogleService-Info.plist successfully linked to Xcode!');