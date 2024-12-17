type AddEmptyRuleAction = ["AddEmptyRule", string, 0, number];
type RemoveColumnAction = ["RemoveColumn", string, string];
type UpdateRecordAction = [
  "UpdateRecord",
  string,
  number,
  Record<string, unknown>,
];
type UserAction = AddEmptyRuleAction | RemoveColumnAction | UpdateRecordAction;
