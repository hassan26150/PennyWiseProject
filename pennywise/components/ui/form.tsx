import React, { createContext, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

export const Form = FormProvider;

/* -----------------------------
   Field Context
------------------------------*/

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

/* -----------------------------
   useFormField Hook
------------------------------*/

export function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    name: fieldContext.name,
    ...fieldState,
  };
}

/* -----------------------------
   FormItem
------------------------------*/

export function FormItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.item}>{children}</View>;
}

/* -----------------------------
   Label
------------------------------*/

export function FormLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  const { error } = useFormField();

  return (
    <Text style={[styles.label, error && styles.errorText]}>
      {children}
    </Text>
  );
}

/* -----------------------------
   Control Wrapper
------------------------------*/

export function FormControl({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View>{children}</View>;
}

/* -----------------------------
   Description
------------------------------*/

export function FormDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Text style={styles.description}>{children}</Text>;
}

/* -----------------------------
   Error Message
------------------------------*/

export function FormMessage() {
  const { error } = useFormField();

  if (!error) return null;

  return (
    <Text style={styles.errorText}>
      {String(error.message)}
    </Text>
  );
}

/* -----------------------------
   Styles
------------------------------*/

const styles = StyleSheet.create({
  item: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  description: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginTop: 4,
  },
});
