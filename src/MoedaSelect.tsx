import React from "react";

const MoedaSelectOptions = React.memo(
  ({ moedas }: { moedas: Record<string, string> }) => {
    return Object.entries(moedas).map(([code, name]) => (
      <option key={code} value={code}>
        {code.toUpperCase()} - {name}
      </option>
    ));
  }
);

export default MoedaSelectOptions;
