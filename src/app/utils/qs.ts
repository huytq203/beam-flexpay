function stringify(input: Record<string, any>) {
  const query = new URLSearchParams();
  
  Object.keys(input).forEach(key => {
    query.set(key, input[key]);
  });
  
  return query.toString();
}

export type Options = {
  allowEmpty?: boolean;
}

function pretty<T extends Record<string, any>>(input: T, options: Options = {}): T {
  let result = {} as any;
  
  const { allowEmpty = true } = options;
  
  Object.keys(input).forEach(key => {
    if (typeof input[key] === 'boolean') {
      result[key] = input[key] ? 'true' : 'false';
      return;
    } 
    
    if (typeof input[key] === 'string') {
      if (input[key].trim() || allowEmpty) {
        result[key] = input[key].trim();
        return;
      }
    }
    
    result[key] = input[key];
  });
  
  return result;
}

export {
  stringify,
  pretty
}
