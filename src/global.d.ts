interface Window {
    zano: Zano;
}

declare module "*.scss" {
    const content: { [className: string]: string };
    export default content;
}
  
declare module "*.svg" {
    import React from "react";
    const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    export default content;
}
  