/*
 * 校验字符串是否是合法邮箱
 * @param email 需要校验的字符串
 * @return boolean
 */
export function isValidEmail(email: string) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
