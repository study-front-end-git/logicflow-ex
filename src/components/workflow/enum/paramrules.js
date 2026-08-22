// 参数名称规则：字母、数字、下划线，不能以数字开头
export const PARAM_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/

// 参数名称规则说明
export const PARAM_NAME_RULE = {
  pattern: PARAM_NAME_REGEX,
  message: '参数名只能包含字母、数字、下划线，且不能以数字开头'
}
