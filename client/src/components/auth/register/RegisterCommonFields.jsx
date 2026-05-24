import { Mail, Phone, User, UserRound } from "lucide-react";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Select from "@/components/ui/Select";

const RegisterCommonFields = ({ register, errors }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="full_name"
          type="text"
          label="Full Name"
          icon={UserRound}
          required
          {...register("full_name")}
          error={errors.full_name?.message}
          placeholder="Sanjay Gurung"
        />

        <Input
          id="email"
          type="email"
          label="Email Address"
          icon={Mail}
          required
          {...register("email")}
          error={errors.email?.message}
          placeholder="sanjay@gmail.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PasswordInput
          id="password"
          label="Password"
          required
          {...register("password")}
          error={errors.password?.message}
          placeholder="Min. 8 characters"
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          required
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          placeholder="Re-enter password"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="phone"
          type="tel"
          label="Phone Number"
          icon={Phone}
          required
          {...register("phone")}
          error={errors.phone?.message}
          placeholder="9878798787"
        />

        <Select
          id="gender"
          label="Gender"
          icon={User}
          required
          {...register("gender")}
          error={errors.gender?.message}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
      </div>
    </>
  );
};

export default RegisterCommonFields;
