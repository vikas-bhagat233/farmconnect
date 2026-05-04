export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength,
    lengthValid: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  };
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

export const validatePrice = (price) => {
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice >= 1 && numPrice <= 100000;
};

export const validateQuantity = (quantity) => {
  const numQuantity = Number(quantity);
  return !isNaN(numQuantity) && numQuantity >= 1 && numQuantity <= 100000;
};

export const validateCropName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

export const validateLocation = (location) => {
  return location && location.trim().length >= 2;
};

export const validateDescription = (description) => {
  return !description || description.length <= 500;
};

export const validateImage = (imageUri) => {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = imageUri.split('.').pop().toLowerCase();
  return validExtensions.includes(extension);
};

export const validateContractAmount = (totalAmount, advanceAmount, remainingAmount) => {
  const expectedAdvance = totalAmount * 0.3;
  const expectedRemaining = totalAmount * 0.7;
  
  return {
    isValid: Math.abs(advanceAmount - expectedAdvance) < 1 && 
             Math.abs(remainingAmount - expectedRemaining) < 1,
    expectedAdvance,
    expectedRemaining,
  };
};

export const validateDate = (date, futureOnly = true) => {
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return false;
  if (futureOnly && inputDate < new Date()) return false;
  return true;
};

export const validatePinCode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

export const validateGST = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

export const validatePAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

export const validateAadhaar = (aadhaar) => {
  const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
  return aadhaarRegex.test(aadhaar);
};

export const validateIFSC = (ifsc) => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

export const validateAccountNumber = (accountNumber) => {
  return accountNumber && accountNumber.length >= 9 && accountNumber.length <= 18;
};

export const validateForm = (fields, validations) => {
  const errors = {};
  
  for (const field in validations) {
    const value = fields[field];
    const validation = validations[field];
    
    if (validation.required && !value) {
      errors[field] = `${field} is required`;
    } else if (value && validation.pattern && !validation.pattern.test(value)) {
      errors[field] = validation.message || `Invalid ${field}`;
    } else if (value && validation.validate && !validation.validate(value)) {
      errors[field] = validation.message || `Invalid ${field}`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};