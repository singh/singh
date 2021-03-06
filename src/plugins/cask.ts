import { Minister } from 'minister';
import { StoreObject } from 'store_object';
import { cmd, cmdCon } from 'utils';
import { Tap } from 'plugins/tap';
import { which, exec } from 'shelljs';

export class Cask extends Minister
{

    private static instance: Cask;
    private constructor () { super(); }

    static getInstance ()
    {
        if ( !this.exist() ) return;
        if ( !Cask.instance ) Cask.instance = new Cask();
        return Cask.instance;
    }

    static exist (): boolean
    {
        if ( which( `brew` ) )
        {
            return !exec( `brew cask`, { silent: true } ).stderr;
        }
        return false;
    }

    dependancies: Minister[] = [ Tap.getInstance() ];

    getName () { return "Cask" }

    async install ( objs: StoreObject[] ): Promise<string | undefined>
    {
        let installList: string = '';
        await Promise.all( objs.map( obj => installList += `${ obj.id } ` ) );
        if ( installList )
            return cmdCon( `HOMEBREW_NO_AUTO_UPDATE=1 brew cask install ${ installList } ` );
    }

    async uninstall ( objs: StoreObject[] ): Promise<string | undefined>
    {
        let uninstallList: string = '';
        await Promise.all( objs.map( obj => uninstallList += `${ obj.id } ` ) );
        if ( uninstallList )
            return cmdCon( `HOMEBREW_NO_AUTO_UPDATE=1 brew cask remove ${ uninstallList } ` );
    }


    version (): Promise<string>
    {
        return cmd( `HOMEBREW_NO_AUTO_UPDATE=1 brew cask --version` );
    }

    async list ( name: string = '' ): Promise<string>
    {
        return cmd( `HOMEBREW_NO_AUTO_UPDATE=1 brew cask list ${ name }` );
    }

    async listLocalObjects (): Promise<StoreObject[]>
    {
        const list = await this.list();
        let instObjs: StoreObject[] = [];
        list.split( '\n' )
            .map( line =>
            {
                if ( line )
                    instObjs.push( { id: line } as StoreObject );
            }
            );
        return instObjs;
    }
}