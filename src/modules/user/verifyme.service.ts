import { HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { CustomHttpException } from '../../helpers/custom-http-filter';

@Injectable()
export class VerifyMeService {
  private readonly baseUrl = process.env.VERIFYME_BASE_URL;
  private readonly secretKey = process.env.VERIFYME_SECRET_KEY;

  private get headers() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async verifyNin(nin: string, firstName: string, lastName: string, dob: string) {
    try {
      // For testing/demo purposes, return mock data if using test key
      if (this.secretKey === 'v_test_secret_key') {
        return {
          status: 'success',
          data: {
            firstname: firstName,
            lastname: lastName,
            nin: nin,
            dob: dob,
          },
        };
      }

      const response = await axios.post(
        `${this.baseUrl}/verifications/identities/nin/${nin}`,
        { firstname: firstName, lastname: lastName, dob },
        { headers: this.headers },
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'NIN verification failed';
      throw new CustomHttpException(message, error.response?.status || HttpStatus.BAD_REQUEST);
    }
  }

  async verifyBvn(bvn: string, firstName: string, lastName: string, dob: string) {
    try {
      // For testing/demo purposes, return mock data if using test key
      if (this.secretKey === 'v_test_secret_key') {
        return {
          status: 'success',
          data: {
            firstName: firstName,
            lastName: lastName,
            bvn: bvn,
            dateOfBirth: dob,
          },
        };
      }

      const response = await axios.post(
        `${this.baseUrl}/verifications/bvn/${bvn}`,
        { firstname: firstName, lastname: lastName, dob },
        { headers: this.headers },
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'BVN verification failed';
      throw new CustomHttpException(message, error.response?.status || HttpStatus.BAD_REQUEST);
    }
  }
}
