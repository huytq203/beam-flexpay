export const convertToISO = (dateString: string) => {
    return new Date(dateString.replace(' ', 'T')).toISOString()
  }