import {
  ArtiusBaseProvider,
  ArtiusModelWrapperInput,
  ArtiusModelResponse,
  ArtiusModelGenerationConfig,
  ArtiusChatHistory,
  ArtiusChatDataFile,
  ArtiusModelGenerationOptions,
  ArtiusToolMap,
  ArtiusToolDecaration
} from "artius";

/**
 * Agent prompt: 
 * [Model] Tôi sẽ làm việc ngay
 * [Tool] def
 * [Tool_result] ghi
 * [Tool] def
 * [Tool_result] 1000
 * [Output] Kết là 1000
*/
 
 
export class ArtiusAgent{
  
  public tools:ArtiusToolMap={};
  public history:any[] = [];
  constructor(
    public name: string,
    public provider:ArtiusBaseProvider
  ){
    
  }
  
  private addHistory(){
    
  }
  
  addTool(tool:ArtiusToolDecaration):void{
    this.tools[tool.name] = tool;
  }
  
  start(){
    this.provider.genertate();
  }
  
}

