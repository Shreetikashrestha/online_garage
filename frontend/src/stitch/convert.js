/**
 * Utility to convert Stitch HTML to React component structure
 * Run: node src/stitch/convert.js
 */
import fs from 'fs';
import path from 'path';

const SCREENS_DIR = '../../backend/stitch-screens';
const OUTPUT_DIR = './screens';

const SCREEN_MAP = {
  '2a02efd6bcf14489a1d1d7f705965701': { name: 'Register', file: 'Register.jsx' },
  '54836375d73a4ba48db868202bc79076': { name: 'Home', file: 'Home.jsx' },
  '83ac02787285405faa7122a63e9e86e6': { name: 'Dashboard', file: 'Dashboard.jsx' },
  '28c924f0a29f41aabf7a24bd0c464158': { name: 'ProblemPicker', file: 'ProblemPicker.jsx' },
  '51aa4e3a38084bf9b77e2ad26d4b58e9': { name: 'MechanicResults', file: 'MechanicResults.jsx' },
  '7d39932202bb4ecabb91132004982605': { name: 'MechanicProfile', file: 'MechanicProfile.jsx' },
  '783e21f0ffcc46359bdcbaf3705f95bf': { name: 'BookingSummary', file: 'BookingSummary.jsx' },
  '5d2f09755196473fb2ad797393813abf': { name: 'PaymentOptions', file: 'PaymentOptions.jsx' },
  '2944a60e30434c7ba4220da5d123f816': { name: 'BookingConfirmed', file: 'BookingConfirmed.jsx' },
  '2e81b71523ca4f618528c608667af0c6': { name: 'Tracking', file: 'Tracking.jsx' },
  'ceb5b07e8e484f698682591a8fa6736a': { name: 'SOSEmergency', file: 'SOSEmergency.jsx' },
  'cd21bb0d90b1440ab7b1bceb8f7407da': { name: 'PartsCatalogue', file: 'PartsCatalogue.jsx' },
  '902050f4d6ff49b59044e0e3bf90f7dc': { name: 'PartDetail', file: 'PartDetail.jsx' },
  '02c752f8069443eebf9f75994c87cf07': { name: 'PartsCheckout', file: 'PartsCheckout.jsx' },
  '5ce1dbdca2044d69a366b577186a221e': { name: 'AccountSettings', file: 'AccountSettings.jsx' },
  'ffc38abefe7a4bfdab75a28f6ff8e5a7': { name: 'Invoices', file: 'Invoices.jsx' },
  'e87c522d057a4dcc8738643e9c2cc70a': { name: 'IdentityVerification', file: 'IdentityVerification.jsx' },
  '1b2ce51a8bf545b4a220f1058bc5b3e1': { name: 'OrderHistory', file: 'OrderHistory.jsx' },
  '348094ffd2374e049079424e8b0a03cc': { name: 'AddVehicle', file: 'Vehicles.jsx' },
  'b407c5e020d94899ad3dc6ecf57b3814': { name: 'VehicleSelection', file: 'VehicleSelection.jsx' },
  'e0a83fe9721f46f2a9b6df1f2d77ca61': { name: 'RemoteInspection', file: 'RemoteInspection.jsx' },
  '17335079874035732825': { name: 'ServiceReview', file: 'ServiceReview.jsx' },
};

// Convert class to className, style strings to objects, etc.
function htmlToJsx(html) {
  let jsx = html
    // class -> className
    .replace(/\bclass=/g, 'className=')
    // Remove Stitch data attributes
    .replace(/{{DATA:SCREEN:[^}]+}}/g, '#')
    // Self-closing tags for void elements
    .replace(/<input([^>]*)(?<!\?)>/g, '<input$1 />')
    .replace(/<br([^>]*)>/g, '<br$1 />')
    .replace(/<hr([^>]*)>/g, '<hr$1 />')
    .replace(/<img([^>]*)>/g, '<img$1 />')
    .replace(/<meta([^>]*)>/g, '<meta$1 />')
    .replace(/<link([^>]*)>/g, '<link$1 />');
  return jsx;
}

function convertHtmlToComponent(filePath, componentName) {
  let html = fs.readFileSync(filePath, 'utf-8');
  
  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return null;
  
  let bodyContent = bodyMatch[1];
  
  // Remove script tags
  bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');
  
  // Convert to JSX
  let jsx = htmlToJsx(bodyContent);
  
  // Create React component
  return `// Auto-generated from Stitch screen: ${componentName}
export default function ${componentName}() {
  return (
    <>
${jsx}
    </>
  );
}
`;
}

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Process all mapped screens
for (const [id, info] of Object.entries(SCREEN_MAP)) {
  const filePath = path.join(SCREENS_DIR, `${id}.html`);
  if (!fs.existsSync(filePath)) {
    console.log(`Missing: ${id}.html for ${info.name}`);
    continue;
  }
  
  const component = convertHtmlToComponent(filePath, info.name);
  if (component) {
    const outPath = path.join(OUTPUT_DIR, info.file);
    fs.writeFileSync(outPath, component);
    console.log(`Created: ${info.file}`);
  }
}

console.log('Done!');
