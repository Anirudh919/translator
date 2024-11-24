import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'translator';
  htmlContent: string = ''; // HTML input
  jsonOutput: any = {}; // Output JSON
  translatedHtml: string = ''; // Output HTML with {{ translate }} bindings
  copyMessage: string = ''; // Status message for copy button

  convertHtmlToJson() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.htmlContent, 'text/html');

    // Parse the HTML content and generate JSON and translated HTML
    const jsonData = this.parseTextContent(doc.body);
    
    // Replacing any newline characters with a space in the resulting JSON output
    Object.keys(jsonData).forEach(key => {
      jsonData[key] = jsonData[key].replace(/\n/g, ' ');
    });

    this.jsonOutput = { DATA: jsonData };

    // Generate HTML with dynamic bindings for translations
    this.translatedHtml = this.generateTranslatedHtml(doc.body);
  }

  // Parse the HTML content and extract static text as JSON
  parseTextContent(element: HTMLElement): any {
    const result: any = {};

    const processTextNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = (node as Text).textContent?.trim();

        // Skip Angular expressions like {{product.taxAuthGeoId}}
        if (textContent && !textContent.includes('{{') && !textContent.includes('}}')) {
          const key = this.formatKey(textContent);
          result[key] = textContent;
        }
      }
    };

    const traverseNodes = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        (node as HTMLElement).childNodes.forEach(child => traverseNodes(child));
      } else {
        processTextNode(node);
      }
    };

    traverseNodes(element);

    return result;
  }

  // Format static text into uppercase keys
  formatKey(text: string): string {
    return text
      .replace(/\s+/g, '_')  // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_]/g, '') // Remove non-alphanumeric characters
      .toUpperCase(); // Convert to uppercase
  }

  // Generate HTML with Angular translate pipe bindings
 // Generate HTML with Angular translate pipe bindings
generateTranslatedHtml(element: HTMLElement): string {
  const processNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textContent = (node as Text).textContent?.trim();

      // Check if the text node is empty or includes Angular expressions
      if (textContent && !textContent.includes('{{') && !textContent.includes('}}')) {
        const key = this.formatKey(textContent);
        return `{{ '${key}' | translate }}`; // Wrap text with translation pipe
      }
      return textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      const attributes = Array.from(el.attributes)
        .map(attr => `${attr.name}="${attr.value}"`)
        .join(' ');
      const innerHtml = Array.from(el.childNodes).map(child => processNode(child)).join('');
      return `<${tagName} ${attributes}>${innerHtml}</${tagName}>`;
    }
    return '';
  };

  return processNode(element);
}


  // Function to copy the translated HTML to clipboard
  copyToClipboard() {
    const textarea = document.createElement('textarea');
    textarea.value = this.translatedHtml;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.copyMessage = 'Copied!';
  }
}
