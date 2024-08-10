{
  description = "Development environment";
  inputs = {
    unstable.url = github:NixOS/nixpkgs/nixos-unstable;
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { nixpkgs, unstable, flake-utils, ... }: flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import unstable {
        inherit system;
      };
    in rec {
      devShell = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs
          nodePackages.pnpm
          nodePackages.prettier
		      nodePackages.eslint
          nodePackages.typescript
          nodePackages.typescript-language-server
          bun
        ];
      };
    }
  );
}
