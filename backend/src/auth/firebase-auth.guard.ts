import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

// Apply with @UseGuards(FirebaseAuthGuard) on any controller/route that
// requires a logged-in user. On success it attaches the DB User row to
// request.user — read it with the @CurrentUser() decorator.
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const idToken = authHeader.slice('Bearer '.length);

    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    let user = await this.prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });

    if (!user) {
      // First time we've ever seen this Firebase identity. Provision the
      // User + an empty Profile + an empty Wallet together in one
      // transaction, so nothing downstream ever has to handle a user
      // that exists but is missing one of those rows.
      user = await this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            firebaseUid: decoded.uid,
            email: decoded.email ?? null,
            phone: decoded.phone_number ?? null,
          },
        });
        await tx.profile.create({ data: { userId: created.id } });
        await tx.wallet.create({ data: { userId: created.id } });
        return created;
      });
    }

    if (user.isBanned) {
      throw new UnauthorizedException('This account has been banned');
    }

    request.user = user;
    return true;
  }
}
