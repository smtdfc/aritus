export class AritusTemplate {
  private template: string;
  private placeholders: string[];
  
  constructor(template: string) {
    this.template = template;
    this.placeholders = this.extractPlaceholders(template);
  }
  
  private extractPlaceholders(template: string): string[] {
    const regex = /{([\w\d_]+)}/g;
    const placeholders = new Set < string > ();
    let match;
    
    while ((match = regex.exec(template)) !== null) {
      placeholders.add(match[1]);
    }
    
    return [...placeholders];
  }
  
  format(values: Record < string, string | number > ): string {
    for (const key of this.placeholders) {
      if (!(key in values)) {
        throw new Error(`Missing value for placeholder: "${key}"`);
      }
    }
    
    return this.template.replace(/{([\w\d_]+)}/g, (_, key) => {
      const value = values[key];
      return String(value);
    });
  }
  

  getPlaceholders(): string[] {
    return this.placeholders;
  }
  

  getTemplate(): string {
    return this.template;
  }
}