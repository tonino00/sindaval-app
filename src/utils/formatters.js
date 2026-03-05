export const formatCPF = (cpf) => {
  if (!cpf) return 'Não informado';
  
  // Remove tudo que não é dígito
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Se tiver menos de 11 dígitos, retorna como está
  if (cleanCPF.length !== 11) return cpf;
  
  // Formata: XXX.XXX.XXX-XX
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Converte para string e remove tudo que não é dígito
  const cleanPhone = String(phone).replace(/\D/g, '');
  
  // Se não tiver dígitos, retorna vazio
  if (cleanPhone.length === 0) return '';
  
  // (XX) XXXXX-XXXX - Celular com 9 dígitos
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  // (XX) XXXX-XXXX - Fixo com 8 dígitos
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  // Se tiver menos de 10 dígitos, formata parcialmente
  if (cleanPhone.length >= 6) {
    return cleanPhone.replace(/(\d{2})(\d+)/, '($1) $2');
  }
  
  // Retorna apenas os números se for muito curto
  return cleanPhone;
};

export const formatCurrency = (value) => {
  if (!value && value !== 0) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleString('pt-BR');
};
