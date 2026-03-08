import fs from 'fs';
import yaml from 'js-yaml';
import { victimPhotos, victimMail, victimMaps } from './src/data/victimContent.ts';

const extraData = {
    victimPhotos,
    victimMail,
    victimMaps
};

const yamlStr = yaml.dump(extraData);

const yamlFile = './public/assets/data/stories/maya_chen_investigation.yaml';
let content = fs.readFileSync(yamlFile, 'utf8');

// The file should be padded into the `story:` key. 
// Since everything is indented by 2 spaces under `story:`, we need to indent yamlStr.
const indentedYamlStr = yamlStr.split('\n').map(line => '  ' + line).join('\n');

content += '\n' + indentedYamlStr;
fs.writeFileSync(yamlFile, content);
console.log("Appended yaml");
