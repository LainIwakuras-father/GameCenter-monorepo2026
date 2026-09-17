/*
    Если значение модификатора интерпретируется как true, то добавляется класс с ключом этого модификатором
    Кроме того, если значение модификатора не является bool типом, то в класс так же добавляется значение этого модификатора:

    bem("participant")("button", { disabled: true, pending: false, type: "machine" }) ->
        "participant__button participant__button_disabled participant__button_type_machine"
    
    Таким образом с каждым активным модификатором добавляется по одному классу

    В Components/status-plate есть примеры
*/
type ModifierValue = boolean | string | number | null | undefined;

export const bem =
  (root: string) =>
  (
    block?: string | null,
    modificators?: Record<string, ModifierValue> | null,
    mix?: string,
  ) => {
    // тут только есть баг, что модификаторы не смогут случится, если не передан block

    if (!block && !modificators) {
      return `${root} ${mix ? mix : ""}`;
    }

    const prefix = block ? `${root}__${block}` : root;

    if (!modificators) {
      return `${prefix} ${mix ? mix : ""}`;
    }

    let resultString = prefix;

    for (const mod of Object.keys(modificators)) {
      const modValue = modificators[mod];

      if (modValue) {
        resultString += ` ${prefix}_${mod}`;

        if (typeof modValue !== "boolean") {
          resultString += `_${modValue}`;
        }
      }
    }

    return `${resultString} ${mix ? mix : ""}`;
  };
