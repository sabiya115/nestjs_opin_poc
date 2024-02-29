/* istanbul ignore file */
import * as iterare from "iterare";
import { ValidationError, BadRequestException } from "@nestjs/common";

export function exceptionFactory(errors: ValidationError[]) {
  throw new BadRequestException({
    message: "Bad Request",
    errors: flattenValidationErrors(errors),
  });
}

function flattenValidationErrors(
  validationErrors: ValidationError[]
): RAW.Error[] {
  return (
    iterare
      .iterate(validationErrors)
      .map((error) => mapChildrenToValidationErrors(error))
      .flatten()
      .filter((item) => !!item.constraints)
      // .map((item) => Object.values(item.constraints))
      .map((item) =>
        Object.keys(item.constraints).map((key) => buildError(item, key))
      )
      .flatten()
      .toArray()
  );
}

function buildError(
  item: {
    property: string;
    variable: string;
    value: any;
    constraints: { [x: string]: string };
  },
  key: string
): RAW.Error {
  const arrayText =
    (key !== "isArray" &&
      key !== "arrayNotEmpty" &&
      item.constraints["isArray"] &&
      "Array") ||
    "";

  const errorObj = {
    errorKey: item?.property,
    errorMessage: `genericErrors.${key}${arrayText}`,
    errorData: {
      key: item.variable || item?.property,
      value: item.value,
      message: item.constraints[key],
    },
    path:  `genericErrors.${key}${arrayText}`
  };

  switch (key) {
    case "maxLength":
      errorObj.errorData["max"] = item.constraints[key] || "";
      break;
  }
  return errorObj;
}

function mapChildrenToValidationErrors(
  error: ValidationError,
  parentPath?: string
) {
  if (!(error.children && error.children.length)) {
    return [error];
  }
  const validationErrors = [];
  parentPath = parentPath ? `${parentPath}.${error.property}` : error.property;
  for (const item of error.children) {
    if (item.children && item.children.length) {
      validationErrors.push(...mapChildrenToValidationErrors(item, parentPath));
    }
    validationErrors.push(prependConstraintsWithParentProp(parentPath, item));
  }
  return validationErrors;
}

function prependConstraintsWithParentProp(
  parentPath: string,
  error: ValidationError
) {
  const constraints = {};
  for (const key in error.constraints) {
    constraints[key] = `${error.constraints[key]}`;
    // constraints[key] = `${parentPath}.${error.constraints[key]}`;
  }
  return Object.assign(Object.assign({}, error), {
    property: `${parentPath}.${error.property}`,
    variable: `${error.property}`,
    constraints,
  });
}
